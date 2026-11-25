import type { CustomRenderMethodInput, Map as MapLibreMap } from "maplibre-gl";
import { describe, expect, it, vi } from "vitest";
import { createNightLayer } from "./nightLayer";
import { sunDirectionAt, type Sky } from "./sun";
import { perspective } from "./starfield";
import { createSunLayer } from "./sunLayer";
import { createMoonLayer } from "./moonLayer";

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
    uniform4fv: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    blendFuncSeparate: vi.fn(),
    drawArrays: vi.fn(),
  };
  return gl;
}

const map = {} as MapLibreMap;

/** A globe view-projection with the camera 5 radii out on +Z, invertible as the Moon layer requires. */
const GLOBE_MATRIX = (() => {
  const m = perspective(0.64, 1, 0.1, 500);
  const out = Float32Array.from(m);
  // Column-major `projection · translateZ(-5)`: only the last column changes.
  for (let row = 0; row < 4; row++) out[12 + row] = m[8 + row] * -5 + m[12 + row];
  return out;
})();

function renderInput(projectionTransition: number) {
  return {
    defaultProjectionData: { projectionTransition, mainMatrix: GLOBE_MATRIX },
  } as unknown as CustomRenderMethodInput;
}

const freshSky = (): Sky => ({ sun: sunDirectionAt(new Date("2024-11-03T12:00:00Z")) });

describe.each([
  ["sun", () => createSunLayer(freshSky())],
  ["night", () => createNightLayer(freshSky(), { enabled: true })],
  ["moon", () => createMoonLayer(freshSky())],
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

describe.each([
  ["sun", createSunLayer],
  ["night", (sky: Sky) => createNightLayer(sky, { enabled: true })],
  ["moon", createMoonLayer],
])("%s layer sky", (_name, create) => {
  const asContext = (gl: ReturnType<typeof mockGl>) => gl as unknown as WebGL2RenderingContext;
  const input = renderInput(1);
  const sunUploads = (gl: ReturnType<typeof mockGl>) =>
    gl.uniform3f.mock.calls.filter((call) => call[0] === sunLocation);
  let sunLocation: unknown;

  it("uploads the sky's Sun at render time and follows a mutation", () => {
    const gl = mockGl();
    gl.getUniformLocation.mockImplementation((_program: unknown, name: string) => {
      const location = { name };
      if (name === "u_sun") sunLocation = location;
      return location;
    });
    const sky = freshSky();
    const layer = create(sky);
    layer.onAdd?.(map, asContext(gl));
    layer.render(asContext(gl), input);
    expect(sunUploads(gl).at(-1)?.slice(1)).toEqual([...sky.sun]);

    sky.sun = sunDirectionAt(new Date("2024-11-03T18:00:00Z"));
    layer.render(asContext(gl), input);
    expect(sunUploads(gl).at(-1)?.slice(1)).toEqual([...sky.sun]);
  });
});
