import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { linkProgram, requireUniform } from "./glProgram";
import { NIGHT_LAYER } from "./regionMapLayers";
import type { Sky } from "./sun";

const LABEL = "Night";

/** Alpha of black over the map on the lit side (-30 % brightness) and on the night side. */
export const DAY_DIM = 0.3;
export const NIGHT_DIM = 0.55;

const VERTEX_SHADER = `#version 300 es
in vec2 a_ndc;
out vec2 v_ndc;
void main() {
  v_ndc = a_ndc;
  gl_Position = vec4(a_ndc, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_ndc;
uniform mat4 u_matrix;
uniform vec3 u_sun;
uniform float u_day;
uniform float u_night;
out vec4 outColor;
void main() {
  // Ray through this pixel in globe coordinates, then its hit on the unit globe (the globe fills the sphere of radius 1).
  mat4 inv = inverse(u_matrix);
  vec4 near = inv * vec4(v_ndc, -1.0, 1.0);
  vec4 far = inv * vec4(v_ndc, 1.0, 1.0);
  vec3 origin = near.xyz / near.w;
  vec3 dir = normalize(far.xyz / far.w - origin);
  float b = dot(origin, dir);
  float disc = b * b - (dot(origin, origin) - 1.0);
  if (disc <= 0.0) discard;
  vec3 hit = origin + dir * (-b - sqrt(disc));
  float night = 1.0 - smoothstep(-0.15, 0.2, dot(normalize(hit), u_sun));
  float alpha = mix(u_day, u_night, night);
  if (alpha <= 0.0) discard;
  outColor = vec4(0.0, 0.0, 0.0, alpha);
}`;

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

type Resources = {
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  buffer: WebGLBuffer;
  matrix: WebGLUniformLocation;
  sun: WebGLUniformLocation;
};

/**
 * Dims the globe: 30 % on the lit side, more on the night side (the half facing away from the Sun), with a soft terminator. A full-screen pass that
 * ray-casts each pixel against the unit globe, drawn over the map layers but under the Moon, Sun and stars.
 */
export function createNightLayer(sky: Sky): CustomLayerInterface {
  let resources: Resources | null = null;

  return {
    id: NIGHT_LAYER,
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
      const location = gl.getAttribLocation(program, "a_ndc");
      if (location < 0) throw new Error(`${LABEL}: missing attribute a_ndc`);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);

      const uniform = (name: string) => requireUniform(gl, LABEL, program, name);
      gl.useProgram(program);
      gl.uniform1f(uniform("u_day"), DAY_DIM);
      gl.uniform1f(uniform("u_night"), NIGHT_DIM);
      resources = { program, vao, buffer, matrix: uniform("u_matrix"), sun: uniform("u_sun") };
    },
    render(context, { defaultProjectionData }: CustomRenderMethodInput) {
      if (resources === null) return;
      // Mid globe-to-mercator transition the matrix is no longer in globe coordinates.
      if (defaultProjectionData.projectionTransition < 1) return;
      const gl = context as WebGL2RenderingContext;
      gl.useProgram(resources.program);
      gl.uniformMatrix4fv(resources.matrix, false, defaultProjectionData.mainMatrix);
      gl.uniform3f(resources.sun, sky.sun[0], sky.sun[1], sky.sun[2]);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
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
