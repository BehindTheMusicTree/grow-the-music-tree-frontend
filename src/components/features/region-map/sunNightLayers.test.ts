import type { CustomRenderMethodInput, Map as MapLibreMap } from "maplibre-gl";
import { describe, expect, it, vi } from "vitest";
import { createNightLayer } from "./nightLayer";
import { createSunLayer } from "./sunLayer";

function mockGl(overrides: { attribute?: number; missingUniform?: string } = {}) {
  const gl = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    ARRAY_BUFFER: 5,
    STATIC_DRAW: 6,
    FLOAT: 7,
    BLEND: 8,
    DEPTH_TEST: 9,
    STENCIL_TEST: 10,
    CULL_FACE: 11,
    TRIANGLE_STRIP: 12,
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    deleteProgram: vi.fn(),
    createVertexArray: vi.fn(() => ({})),
    deleteVertexArray: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    deleteBuffer: vi.fn(),
    bindVertexArray: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    getAttribLocation: vi.fn(() => overrides.attribute ?? 0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    useProgram: vi.fn(),
    getUniformLocation: vi.fn((_program: unknown, name: string) => (name === overrides.missingUniform ? null : {})),
    uniform1f: vi.fn(),
    uniform3f: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    blendFuncSeparate: vi.fn(),
    drawArrays: vi.fn(),
  };
  return gl;
}

const map = {} as MapLibreMap;

function renderInput(projectionTransition: number) {
  return {
    defaultProjectionData: { projectionTransition, mainMatrix: new Float32Array(16) },
  } as unknown as CustomRenderMethodInput;
}

describe.each([
  ["sun", createSunLayer],
  ["night", createNightLayer],
])("%s layer", (_name, create) => {
  const asContext = (gl: ReturnType<typeof mockGl>) => gl as unknown as WebGL2RenderingContext;

  it("draws once the globe projection is fully applied", () => {
    const gl = mockGl();
    const layer = create();
    layer.onAdd?.(map, asContext(gl));
    layer.render(asContext(gl), renderInput(1));
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });

  it("skips drawing during the globe-to-mercator transition", () => {
    const gl = mockGl();
    const layer = create();
    layer.onAdd?.(map, asContext(gl));
    layer.render(asContext(gl), renderInput(0.5));
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it("does not draw before it is added", () => {
    const gl = mockGl();
    create().render(asContext(gl), renderInput(1));
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it("throws when the vertex attribute is missing", () => {
    const gl = mockGl({ attribute: -1 });
    expect(() => create().onAdd?.(map, asContext(gl))).toThrow(/missing attribute/);
  });

  it("throws when a uniform is missing", () => {
    const gl = mockGl({ missingUniform: "u_matrix" });
    expect(() => create().onAdd?.(map, asContext(gl))).toThrow(/missing uniform u_matrix/);
  });

  it("releases its program, buffer and VAO on removal", () => {
    const gl = mockGl();
    const layer = create();
    layer.onAdd?.(map, asContext(gl));
    layer.onRemove?.(map, asContext(gl));
    expect(gl.deleteProgram).toHaveBeenCalledTimes(1);
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
    expect(gl.deleteVertexArray).toHaveBeenCalledTimes(1);
  });
});
