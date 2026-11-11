function compile(gl: WebGL2RenderingContext, label: string, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) throw new Error(`${label}: cannot create a shader`);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`${label}: shader compilation failed: ${log}`);
  }
  return shader;
}

/** Compiles and links a program; `label` prefixes every error so a failing layer is identifiable. */
export function linkProgram(
  gl: WebGL2RenderingContext,
  label: string,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const program = gl.createProgram();
  if (program === null) throw new Error(`${label}: cannot create a program`);
  const vertex = compile(gl, label, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, label, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`${label}: program link failed: ${log}`);
  }
  return program;
}

export function requireUniform(
  gl: WebGL2RenderingContext,
  label: string,
  program: WebGLProgram,
  name: string,
): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);
  if (location === null) throw new Error(`${label}: missing uniform ${name}`);
  return location;
}
