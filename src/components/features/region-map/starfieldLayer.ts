import type { CustomLayerInterface, CustomRenderMethodInput, Map as MapLibreMap } from "maplibre-gl";
import { STARFIELD_LAYER } from "./regionMapLayers";
import { generateStars, STAR_COUNT, STAR_SEED, STAR_STRIDE, starfieldMatrix } from "./starfield";

const VERTEX_SHADER = `#version 300 es
in vec3 a_dir;
in float a_size;
in float a_brightness;
uniform mat4 u_matrix;
uniform float u_pixel_ratio;
uniform vec2 u_size_range;
out float v_brightness;
void main() {
  // xyww pins every star to the far plane: a sky at infinity that only rotates.
  gl_Position = (u_matrix * vec4(a_dir, 1.0)).xyww;
  gl_PointSize = clamp(a_size * u_pixel_ratio, u_size_range.x, u_size_range.y);
  v_brightness = a_brightness;
}`;

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;
in float v_brightness;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
  float alpha = (1.0 - smoothstep(0.4, 1.0, d)) * v_brightness;
  outColor = vec4(vec3(alpha), alpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) throw new Error("Starfield: cannot create a shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Starfield: shader compilation failed: ${log}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext): WebGLProgram {
  const program = gl.createProgram();
  if (program === null) throw new Error("Starfield: cannot create a program");
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Starfield: program link failed: ${log}`);
  }
  return program;
}

type Resources = {
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  buffer: WebGLBuffer;
  matrix: WebGLUniformLocation;
  pixelRatio: WebGLUniformLocation;
  sizeRange: WebGLUniformLocation;
};

function requireUniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);
  if (location === null) throw new Error(`Starfield: missing uniform ${name}`);
  return location;
}

/**
 * Static stars drawn "under" the frame: they only show where the framebuffer is still transparent, so the
 * opaque globe hides them with no depth coupling, and the atmosphere drawn afterwards blends over them.
 */
export function createStarfieldLayer(): CustomLayerInterface {
  let map: MapLibreMap | null = null;
  let resources: Resources | null = null;
  const vertexCount = STAR_COUNT;

  return {
    id: STARFIELD_LAYER,
    type: "custom",
    renderingMode: "2d",
    onAdd(addedTo, context) {
      const gl = context as WebGL2RenderingContext;
      const program = link(gl);
      const vao = gl.createVertexArray();
      const buffer = gl.createBuffer();
      if (vao === null || buffer === null) throw new Error("Starfield: cannot allocate GL buffers");
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, generateStars(STAR_COUNT, STAR_SEED), gl.STATIC_DRAW);
      const stride = STAR_STRIDE * Float32Array.BYTES_PER_ELEMENT;
      const attributes = [
        { name: "a_dir", size: 3, offset: 0 },
        { name: "a_size", size: 1, offset: 3 },
        { name: "a_brightness", size: 1, offset: 4 },
      ];
      for (const { name, size, offset } of attributes) {
        const location = gl.getAttribLocation(program, name);
        if (location < 0) throw new Error(`Starfield: missing attribute ${name}`);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset * Float32Array.BYTES_PER_ELEMENT);
      }
      gl.bindVertexArray(null);
      map = addedTo;
      resources = {
        program,
        vao,
        buffer,
        matrix: requireUniform(gl, program, "u_matrix"),
        pixelRatio: requireUniform(gl, program, "u_pixel_ratio"),
        sizeRange: requireUniform(gl, program, "u_size_range"),
      };
    },
    render(context, { fov }: CustomRenderMethodInput) {
      if (map === null || resources === null) return;
      const gl = context as WebGL2RenderingContext;
      const center = map.getCenter();
      const matrix = starfieldMatrix(
        {
          lng: center.lng,
          lat: center.lat,
          bearing: map.getBearing(),
          pitch: map.getPitch(),
          roll: map.getRoll(),
        },
        fov,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
      );
      const sizeRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array;
      gl.useProgram(resources.program);
      gl.uniformMatrix4fv(resources.matrix, false, matrix);
      gl.uniform1f(resources.pixelRatio, window.devicePixelRatio);
      gl.uniform2f(resources.sizeRange, sizeRange[0], sizeRange[1]);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
      gl.bindVertexArray(resources.vao);
      gl.drawArrays(gl.POINTS, 0, vertexCount);
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
      map = null;
    },
  };
}
