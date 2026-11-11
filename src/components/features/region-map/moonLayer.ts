import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { linkProgram, requireUniform } from "./glProgram";
import {
  cameraFromMatrix,
  MARIA,
  mariaUniform,
  moonBasis,
  moonBodyFrame,
  moonCenter,
  moonInFront,
  MOON_RADIUS,
  type Vec3,
} from "./moon";
import { MOON_LAYER } from "./regionMapLayers";
import { SUN_DIRECTION } from "./sun";

const LABEL = "Moon";

const VERTEX_SHADER = `#version 300 es
in vec2 a_uv;
uniform mat4 u_matrix;
uniform vec3 u_center;
uniform vec3 u_right;
uniform vec3 u_up;
uniform float u_radius;
out vec2 v_uv;
void main() {
  vec3 world = u_center + (u_right * a_uv.x + u_up * a_uv.y) * u_radius;
  // xyww keeps x/y/w exact at the Moon's distance while pinning depth to the far plane, which is only
  // about Earth-sized: draw order, not depth, decides what hides what.
  gl_Position = (u_matrix * vec4(world, 1.0)).xyww;
  v_uv = a_uv;
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
#define MARIA_COUNT ${MARIA.length}
in vec2 v_uv;
uniform vec3 u_right;
uniform vec3 u_up;
uniform vec3 u_to_camera;
uniform vec3 u_sun;
uniform vec4 u_maria[MARIA_COUNT];
out vec4 outColor;
void main() {
  float r2 = dot(v_uv, v_uv);
  float r = sqrt(r2);
  float alpha = 1.0 - smoothstep(1.0 - fwidth(r), 1.0, r);
  if (alpha <= 0.0) discard;
  vec3 n = u_right * v_uv.x + u_up * v_uv.y + u_to_camera * sqrt(max(0.0, 1.0 - r2));
  float mare = 0.0;
  for (int i = 0; i < MARIA_COUNT; i++) {
    mare = max(mare, smoothstep(u_maria[i].w - 0.004, u_maria[i].w + 0.004, dot(n, u_maria[i].xyz)));
  }
  float albedo = mix(0.78, 0.36, mare);
  float light = 0.03 + 0.97 * smoothstep(-0.04, 0.3, dot(n, u_sun));
  float limb = mix(0.75, 1.0, sqrt(max(0.0, 1.0 - r2)));
  vec3 color = vec3(0.96, 0.95, 0.9) * albedo * light * limb;
  outColor = vec4(color * alpha, alpha);
}`;

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

type Resources = {
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  buffer: WebGLBuffer;
  matrix: WebGLUniformLocation;
  right: WebGLUniformLocation;
  up: WebGLUniformLocation;
  toCamera: WebGLUniformLocation;
  center3: Vec3;
};

/**
 * The Moon: a lit sphere impostor at a finite distance, so it parallaxes against the starfield and scales
 * with zoom. Drawn "under" the frame like the stars (the opaque globe hides it, it hides the stars) unless the
 * camera has flown beyond it, when it is drawn over the globe instead.
 */
export function createMoonLayer(): CustomLayerInterface {
  let resources: Resources | null = null;

  return {
    id: MOON_LAYER,
    type: "custom",
    renderingMode: "2d",
    onAdd(_addedTo, context) {
      const gl = context as WebGL2RenderingContext;
      const program = linkProgram(gl, LABEL, VERTEX_SHADER, FRAGMENT_SHADER);
      const vao = gl.createVertexArray();
      const buffer = gl.createBuffer();
      if (vao === null || buffer === null) throw new Error(`${LABEL}: cannot allocate GL buffers`);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, "a_uv");
      if (location < 0) throw new Error(`${LABEL}: missing attribute a_uv`);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);

      // Everything but the camera is fixed: compute it once and upload it once.
      const center3 = moonCenter();
      const frame = moonBodyFrame(center3);
      const uniform = (name: string) => requireUniform(gl, LABEL, program, name);
      gl.useProgram(program);
      gl.uniform3f(uniform("u_sun"), SUN_DIRECTION[0], SUN_DIRECTION[1], SUN_DIRECTION[2]);
      gl.uniform4fv(uniform("u_maria"), mariaUniform(frame));
      gl.uniform3f(uniform("u_center"), center3[0], center3[1], center3[2]);
      gl.uniform1f(uniform("u_radius"), MOON_RADIUS);
      resources = {
        program,
        vao,
        buffer,
        matrix: uniform("u_matrix"),
        right: uniform("u_right"),
        up: uniform("u_up"),
        toCamera: uniform("u_to_camera"),
        center3,
      };
    },
    render(context, { defaultProjectionData }: CustomRenderMethodInput) {
      if (resources === null) return;
      // Mid globe-to-mercator transition the matrix is no longer in globe coordinates; the globe fills the view then.
      if (defaultProjectionData.projectionTransition < 1) return;
      const gl = context as WebGL2RenderingContext;
      const camera = cameraFromMatrix(defaultProjectionData.mainMatrix);
      const { right, up, toCamera } = moonBasis(camera, resources.center3);
      gl.useProgram(resources.program);
      gl.uniformMatrix4fv(resources.matrix, false, defaultProjectionData.mainMatrix);
      gl.uniform3f(resources.right, right[0], right[1], right[2]);
      gl.uniform3f(resources.up, up[0], up[1], up[2]);
      gl.uniform3f(resources.toCamera, toCamera[0], toCamera[1], toCamera[2]);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      if (moonInFront(camera, resources.center3)) {
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
      }
      gl.bindVertexArray(resources.vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindVertexArray(null);
    },
    onRemove(_removedFrom, context) {
      const gl = context as WebGL2RenderingContext;
      if (resources !== null) {
        gl.deleteProgram(resources.program);
        gl.deleteBuffer(resources.buffer);
        gl.deleteVertexArray(resources.vao);
      }
      resources = null;
    },
  };
}
