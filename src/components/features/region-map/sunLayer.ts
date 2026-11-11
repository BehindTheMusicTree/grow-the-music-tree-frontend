import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { linkProgram, requireUniform } from "./glProgram";
import { moonBasis } from "./moon";
import { SUN_LAYER } from "./regionMapLayers";
import { SUN_ANGULAR_RADIUS, SUN_DIRECTION, SUN_GLOW_SCALE } from "./sun";

const LABEL = "Sun";

const VERTEX_SHADER = `#version 300 es
in vec2 a_uv;
uniform mat4 u_matrix;
uniform vec3 u_sun;
uniform vec3 u_right;
uniform vec3 u_up;
uniform float u_extent;
out vec2 v_uv;
void main() {
  vec3 dir = u_sun + (u_right * a_uv.x + u_up * a_uv.y) * u_extent;
  // w = 0 drops the globe translation: the Sun sits at infinity, without parallax. xyww pins it to the far plane.
  gl_Position = (u_matrix * vec4(dir, 0.0)).xyww;
  v_uv = a_uv;
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform float u_scale;
out vec4 outColor;
void main() {
  // r is in disc radii: 1.0 is the disc edge, u_scale the quad edge, where the halo has faded out.
  float r = length(v_uv) * u_scale;
  float disc = 1.0 - smoothstep(1.0 - fwidth(r), 1.0, r);
  float glow = exp(-0.9 * r) * (1.0 - smoothstep(0.5 * u_scale, u_scale, r)) * 0.6;
  float alpha = max(disc, glow);
  if (alpha <= 0.0) discard;
  vec3 color = mix(vec3(1.0, 0.86, 0.6), vec3(1.0, 0.98, 0.92), disc);
  outColor = vec4(color * alpha, alpha);
}`;

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

type Resources = {
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  buffer: WebGLBuffer;
  matrix: WebGLUniformLocation;
};

/**
 * The Sun: a bright disc with a soft halo, fixed in the sky like the stars. Drawn "under" the frame, so the
 * opaque globe hides it, it hides the stars behind it, and the atmosphere blends over it.
 */
export function createSunLayer(): CustomLayerInterface {
  let resources: Resources | null = null;

  return {
    id: SUN_LAYER,
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

      // Everything but the matrix is fixed: compute it once and upload it once.
      const { right, up } = moonBasis([0, 0, 0], SUN_DIRECTION);
      const uniform = (name: string) => requireUniform(gl, LABEL, program, name);
      gl.useProgram(program);
      gl.uniform3f(uniform("u_sun"), SUN_DIRECTION[0], SUN_DIRECTION[1], SUN_DIRECTION[2]);
      gl.uniform3f(uniform("u_right"), right[0], right[1], right[2]);
      gl.uniform3f(uniform("u_up"), up[0], up[1], up[2]);
      gl.uniform1f(uniform("u_extent"), Math.tan(SUN_ANGULAR_RADIUS) * SUN_GLOW_SCALE);
      gl.uniform1f(uniform("u_scale"), SUN_GLOW_SCALE);
      resources = { program, vao, buffer, matrix: uniform("u_matrix") };
    },
    render(context, { defaultProjectionData }: CustomRenderMethodInput) {
      if (resources === null) return;
      // Mid globe-to-mercator transition the matrix is no longer in globe coordinates; the globe fills the view then.
      if (defaultProjectionData.projectionTransition < 1) return;
      const gl = context as WebGL2RenderingContext;
      gl.useProgram(resources.program);
      gl.uniformMatrix4fv(resources.matrix, false, defaultProjectionData.mainMatrix);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
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
