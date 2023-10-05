/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/lib/Camera.ts":
/*!***************************!*\
  !*** ./src/lib/Camera.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Vector3_1 = __webpack_require__(/*! ./Vector3 */ "./src/lib/Vector3.ts");
class Camera {
    fov;
    aspectRatio;
    near;
    position = new Vector3_1.default(0, 0, 0);
    target = new Vector3_1.default(0, 0, 0);
    up = new Vector3_1.default(0, 1, 0);
    constructor(fov, aspectRatio, near) {
        this.fov = fov;
        this.aspectRatio = aspectRatio;
        this.near = near;
    }
}
exports["default"] = Camera;


/***/ }),

/***/ "./src/lib/Face.ts":
/*!*************************!*\
  !*** ./src/lib/Face.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Face {
    u;
    v;
    w;
    normal;
    material;
    constructor(u, v, w, normal, material) {
        this.u = u;
        this.v = v;
        this.w = w;
        this.normal = normal;
        this.material = material;
    }
    ;
    clone() {
        return new Face(this.u.clone(), this.v.clone(), this.w.clone(), this.normal, this.material);
    }
    translate(v) {
        for (const s of this) {
            for (const d of 'xyz') {
                // @ts-ignore
                s[d] += v[d];
            }
        }
        return this;
    }
    *[Symbol.iterator]() {
        yield this.u;
        yield this.v;
        yield this.w;
    }
}
exports["default"] = Face;


/***/ }),

/***/ "./src/lib/Geometry.ts":
/*!*****************************!*\
  !*** ./src/lib/Geometry.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Geometry {
    vertecies;
    faces;
    constructor(vertecies, faces) {
        this.vertecies = vertecies;
        this.faces = faces;
    }
}
exports["default"] = Geometry;


/***/ }),

/***/ "./src/lib/Material.ts":
/*!*****************************!*\
  !*** ./src/lib/Material.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Material {
    r;
    g;
    b;
    a;
    constructor(r = 256, g = 256, b = 256, a = 256) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    ;
}
exports["default"] = Material;


/***/ }),

/***/ "./src/lib/Mesh.ts":
/*!*************************!*\
  !*** ./src/lib/Mesh.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Vector3_1 = __webpack_require__(/*! ./Vector3 */ "./src/lib/Vector3.ts");
class Mesh {
    geometry;
    material;
    constructor(geometry, material) {
        this.geometry = geometry;
        this.material = material;
    }
    ;
    position = new Vector3_1.default(0, 0, 0);
    children = [];
    parent;
    add(mesh) {
        mesh.parent = this;
        this.children.push(mesh);
    }
    attach(mesh) {
        this.add(mesh);
        for (const child of mesh) {
            child.position.sub(this.position);
        }
    }
    rotate(axis, angle) {
        const radians = angle * (Math.PI / 180);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const { x: u, y: v, z: w } = axis.norm();
        const applyRotation = (vertex) => {
            const rotatedX = vertex.x * (cos + u * u * (1 - cos))
                + vertex.y * (u * v * (1 - cos) - w * sin)
                + vertex.z * (u * w * (1 - cos) + v * sin);
            const rotatedY = vertex.x * (v * u * (1 - cos) + w * sin)
                + vertex.y * (cos + v * v * (1 - cos))
                + vertex.z * (v * w * (1 - cos) - u * sin);
            const rotatedZ = vertex.x * (w * u * (1 - cos) - v * sin)
                + vertex.y * (w * v * (1 - cos) + u * sin)
                + vertex.z * (cos + w * w * (1 - cos));
            vertex.x = rotatedX;
            vertex.y = rotatedY;
            vertex.z = rotatedZ;
        };
        this.geometry.vertecies.forEach(applyRotation);
        this.geometry.faces.forEach(face => applyRotation(face.normal));
    }
    *[Symbol.iterator]() {
        yield this;
        for (const child of this.children) {
            yield* child;
        }
    }
    get worldPosition() {
        if (this.parent) {
            return this.parent.worldPosition.add(this.position);
        }
        else {
            return this.position;
        }
    }
}
exports["default"] = Mesh;


/***/ }),

/***/ "./src/lib/Raytracer.ts":
/*!******************************!*\
  !*** ./src/lib/Raytracer.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Raytracer {
    scene;
    origin;
    static EPSILON = 1e-7;
    constructor(scene, origin) {
        this.scene = scene;
        this.origin = origin;
    }
    ;
    *castRay(dir) {
        // Möller–Trumbore
        for (const mesh of this.scene) {
            for (const origFace of mesh.geometry.faces) {
                const face = origFace.clone().translate(mesh.worldPosition);
                const edge1 = face.v.sub(face.u);
                const edge2 = face.w.sub(face.u);
                const h = dir.cross(edge2);
                const a = edge1.dot(h);
                if (a > -Raytracer.EPSILON && a < Raytracer.EPSILON) {
                    continue;
                }
                const f = 1.0 / a;
                const s = this.origin.sub(face.u);
                const u = f * s.dot(h);
                if (u < 0.0 || u > 1.0) {
                    continue;
                }
                const q = s.cross(edge1);
                const v = f * dir.dot(q);
                if (v < 0.0 || u + v > 1.0) {
                    continue;
                }
                const t = f * edge2.dot(q);
                if (t > Raytracer.EPSILON) {
                    const point = this.origin.add(dir.multScalar(t));
                    const dotProduct = dir.dot(face.normal);
                    const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct));
                    const angle = Math.acos(clampedDotProduct) * (180 / Math.PI);
                    const distance = this.origin.sub(point).len();
                    const dist1 = this.distancePointToSegment(point, face.u, face.v);
                    const dist2 = this.distancePointToSegment(point, face.v, face.w);
                    const dist3 = this.distancePointToSegment(point, face.w, face.u);
                    const edgeDist = Math.min(dist1, dist2, dist3);
                    yield { angle, point, distance, mesh, face, edgeDist };
                }
            }
        }
    }
    distancePointToSegment(point, a, b) {
        const ab = b.sub(a);
        const ap = point.sub(a);
        const bp = point.sub(b);
        const e = ap.dot(ab);
        if (e <= 0) {
            return ap.len();
        }
        const f = ab.dot(ab);
        if (e >= f) {
            return bp.len();
        }
        return Math.sqrt(ap.dot(ap) - (e * e) / f);
    }
}
exports["default"] = Raytracer;


/***/ }),

/***/ "./src/lib/Renderer.ts":
/*!*****************************!*\
  !*** ./src/lib/Renderer.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Material_1 = __webpack_require__(/*! ./Material */ "./src/lib/Material.ts");
const Raytracer_1 = __webpack_require__(/*! ./Raytracer */ "./src/lib/Raytracer.ts");
class Renderer {
    config;
    buffer;
    mod;
    total;
    renderer;
    imageData;
    needsUpdate = false;
    pixels;
    constructor(config, buffer, mod, total) {
        this.config = config;
        this.buffer = buffer;
        this.mod = mod;
        this.total = total;
        this.renderer = new OffscreenCanvas(config.width, config.height);
        this.imageData = this.renderer.getContext("2d").getImageData(0, 0, config.width, config.height);
        const sharedUint8Array = new Uint8ClampedArray(buffer);
        sharedUint8Array.set(this.imageData.data);
        this.pixels = sharedUint8Array;
    }
    // private get pixels() {
    //     return this.imageData.data;
    // }
    setPixel(x, y, r, g, b, a = 256) {
        const index = (y * this.config.width + x) * 4;
        const pixels = this.pixels;
        pixels[index + 0] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = a;
        this.needsUpdate = true;
    }
    render(camera, scene) {
        this.pixels.fill(256);
        const planeHeight = 2 * Math.tan((camera.fov / 2) * (Math.PI / 180)) * camera.near;
        const planeWidth = planeHeight * camera.aspectRatio;
        const forward = camera.target.norm();
        const right = camera.up.cross(forward).norm();
        const up = forward.cross(right).norm();
        const center = camera.position.add(forward.multScalar(camera.near));
        const halfUp = up.multScalar(planeHeight / 2);
        const halfRight = right.multScalar(planeWidth / 2);
        const topLeft = center.add(halfUp).sub(halfRight);
        const topRight = center.add(halfUp).add(halfRight);
        const bottomLeft = center.sub(halfUp).sub(halfRight);
        const xStep = topRight.sub(topLeft).multScalar(1 / this.config.width);
        const yStep = bottomLeft.sub(topLeft).multScalar(1 / this.config.height);
        const rc = new Raytracer_1.default(scene, camera.position);
        for (let y = this.mod; y < this.config.height; y += this.total) {
            for (let x = 0; x < this.config.width; x++) {
                const dir = topLeft
                    .add(xStep.multScalar(x))
                    .add(yStep.multScalar(y))
                    .sub(camera.position)
                    .norm();
                const hits = Array.from(rc.castRay(dir));
                if (!hits.length) {
                    continue;
                }
                if (this.config.wireframe) {
                    for (const hit of hits) {
                        if (hit.edgeDist < this.config.wireframe) {
                            const { r, g, b } = hit.face.material ?? hit.mesh.material;
                            this.setPixel(x, y, r, g, b);
                        }
                    }
                }
                else {
                    const sorted = hits.sort((a, b) => a.distance - b.distance);
                    let strength = 0;
                    const colors = [];
                    for (const hit of sorted) {
                        const localAlpha = (hit.face.material ?? hit.mesh.material).a / 256;
                        const localStrength = (1 - strength) * localAlpha;
                        strength += localStrength;
                        colors.push([(hit.face.material ?? hit.mesh.material), localStrength, hit.angle / 180]);
                        if (strength > 0.999) {
                            break;
                        }
                    }
                    const { r, g, b, a } = colors.reduce((acc, [{ r, g, b, a }, s, q]) => {
                        acc.r += r * q * s;
                        acc.g += g * q * s;
                        acc.b += b * q * s;
                        acc.a += s * 256;
                        return acc;
                    }, new Material_1.default(0, 0, 0, 0));
                    this.setPixel(x, y, r, g, b);
                }
            }
        }
    }
}
exports["default"] = Renderer;


/***/ }),

/***/ "./src/lib/Scene.ts":
/*!**************************!*\
  !*** ./src/lib/Scene.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Scene {
    meshes = [];
    add(...objs) {
        this.meshes.push(...objs);
    }
    *[Symbol.iterator]() {
        for (const mesh of this.meshes) {
            yield* mesh;
        }
    }
}
exports["default"] = Scene;


/***/ }),

/***/ "./src/lib/Vector3.ts":
/*!****************************!*\
  !*** ./src/lib/Vector3.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Vector3 {
    x;
    y;
    z;
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    ;
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mult(v) {
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }
    multScalar(s) {
        return new Vector3(this.x * s, this.y * s, this.z * s);
    }
    lenSq() {
        return this.x ** 2 + this.y ** 2 + this.z ** 2;
    }
    len() {
        return Math.sqrt(this.lenSq());
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        return new Vector3(x, y, z);
    }
    norm() {
        const length = this.len();
        if (length === 0)
            return new Vector3();
        if (length === 1) {
            return this.clone();
        }
        return new Vector3(this.x / length, this.y / length, this.z / length);
    }
}
exports["default"] = Vector3;


/***/ }),

/***/ "./src/lib/geometries/CubeGeometry.ts":
/*!********************************************!*\
  !*** ./src/lib/geometries/CubeGeometry.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Face_1 = __webpack_require__(/*! ../Face */ "./src/lib/Face.ts");
const Geometry_1 = __webpack_require__(/*! ../Geometry */ "./src/lib/Geometry.ts");
const Vector3_1 = __webpack_require__(/*! ../Vector3 */ "./src/lib/Vector3.ts");
class CubeGeometry extends Geometry_1.default {
    width;
    height;
    depth;
    constructor(width, height, depth) {
        const vertecies = [];
        for (const x of [-0.5, 0.5]) {
            for (const y of [-0.5, 0.5]) {
                for (const z of [-0.5, 0.5]) {
                    vertecies.push(new Vector3_1.default(width * x, height * y, depth * z));
                }
            }
        }
        super(vertecies, [
            new Face_1.default(vertecies[0], vertecies[1], vertecies[4], new Vector3_1.default(0, -1, 0)), new Face_1.default(vertecies[1], vertecies[4], vertecies[5], new Vector3_1.default(0, -1, 0)),
            new Face_1.default(vertecies[2], vertecies[3], vertecies[6], new Vector3_1.default(0, 1, 0)), new Face_1.default(vertecies[3], vertecies[6], vertecies[7], new Vector3_1.default(0, 1, 0)),
            new Face_1.default(vertecies[0], vertecies[1], vertecies[2], new Vector3_1.default(-1, 0, 0)), new Face_1.default(vertecies[1], vertecies[2], vertecies[3], new Vector3_1.default(-1, 0, 0)),
            new Face_1.default(vertecies[4], vertecies[5], vertecies[6], new Vector3_1.default(1, 0, 0)), new Face_1.default(vertecies[5], vertecies[6], vertecies[7], new Vector3_1.default(1, 0, 0)),
            new Face_1.default(vertecies[0], vertecies[2], vertecies[4], new Vector3_1.default(0, 0, -1)), new Face_1.default(vertecies[2], vertecies[4], vertecies[6], new Vector3_1.default(0, 0, -1)),
            new Face_1.default(vertecies[1], vertecies[3], vertecies[5], new Vector3_1.default(0, 0, 1)), new Face_1.default(vertecies[3], vertecies[5], vertecies[7], new Vector3_1.default(0, 0, 1)), // back
        ]);
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
}
exports["default"] = CubeGeometry;


/***/ }),

/***/ "./src/lib/parsers/OBJParser.ts":
/*!**************************************!*\
  !*** ./src/lib/parsers/OBJParser.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Face_1 = __webpack_require__(/*! @/Face */ "./src/lib/Face.ts");
const Geometry_1 = __webpack_require__(/*! @/Geometry */ "./src/lib/Geometry.ts");
const Vector3_1 = __webpack_require__(/*! @/Vector3 */ "./src/lib/Vector3.ts");
class OBJParser {
    static async parse(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load OBJ file from ${url}: ${response.statusText}`);
        }
        const objText = await response.text();
        const lines = objText.split('\n');
        const vertices = [];
        const normals = [];
        const faces = [];
        for (const line of lines) {
            const tokens = line.split(/\s+/);
            const command = tokens[0];
            switch (command) {
                case 'v':
                    vertices.push(new Vector3_1.default(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])));
                    break;
                case 'vn':
                    normals.push(new Vector3_1.default(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])));
                    break;
                case 'f':
                    const vertexIndices = [];
                    const normalIndices = [];
                    tokens.slice(1).forEach(token => {
                        const [vertexIndex, , normalIndex] = token.split('/').map(Number);
                        vertexIndices.push(vertexIndex - 1);
                        normalIndices.push(normalIndex - 1);
                    });
                    // Triangulate the face if it has more than 3 vertices
                    for (let i = 1; i < vertexIndices.length - 1; i++) {
                        const faceVertices = [
                            vertices[vertexIndices[0]],
                            vertices[vertexIndices[i]],
                            vertices[vertexIndices[i + 1]]
                        ];
                        const faceNormal = normals[normalIndices[0]]; // Adjust this as needed to handle per-vertex normals
                        faces.push(new Face_1.default(faceVertices[0], faceVertices[1], faceVertices[2], faceNormal));
                    }
                    break;
            }
        }
        return new Geometry_1.default(vertices, faces);
    }
}
exports["default"] = OBJParser;


/***/ }),

/***/ "./src/lib/setup.ts":
/*!**************************!*\
  !*** ./src/lib/setup.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Camera_1 = __webpack_require__(/*! ./Camera */ "./src/lib/Camera.ts");
const Renderer_1 = __webpack_require__(/*! ./Renderer */ "./src/lib/Renderer.ts");
const Scene_1 = __webpack_require__(/*! ./Scene */ "./src/lib/Scene.ts");
let _buildScene;
let _data;
self.onmessage = ({ data }) => {
    _data = data;
    if (_buildScene) {
        doSetup();
    }
};
function setup(buildScene) {
    _buildScene = buildScene;
    if (_data) {
        doSetup();
    }
}
exports["default"] = setup;
async function doSetup() {
    const scene = new Scene_1.default();
    const renderer = new Renderer_1.default(_data.config, _data.buffer, _data.mod, _data.total);
    const camera = new Camera_1.default(_data.config.cameraFov, renderer.config.width / renderer.config.height, _data.config.cameraNear);
    await _buildScene({ scene, camera, renderer });
    renderer.render(camera, scene);
    self.close();
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!********************************!*\
  !*** ./src/scenes/example3.ts ***!
  \********************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Material_1 = __webpack_require__(/*! @/Material */ "./src/lib/Material.ts");
const Mesh_1 = __webpack_require__(/*! @/Mesh */ "./src/lib/Mesh.ts");
const Vector3_1 = __webpack_require__(/*! @/Vector3 */ "./src/lib/Vector3.ts");
const CubeGeometry_1 = __webpack_require__(/*! @/geometries/CubeGeometry */ "./src/lib/geometries/CubeGeometry.ts");
const OBJParser_1 = __webpack_require__(/*! @/parsers/OBJParser */ "./src/lib/parsers/OBJParser.ts");
const setup_1 = __webpack_require__(/*! @/setup */ "./src/lib/setup.ts");
(0, setup_1.default)(async ({ scene, camera }) => {
    const cube = new CubeGeometry_1.default(0.5, 0.5, 0.5);
    const geo = await OBJParser_1.default.parse("suzanne.obj");
    const mesh = new Mesh_1.default(geo, new Material_1.default(255, 0, 0));
    mesh.position.set(0, 0, 4);
    mesh.rotate(new Vector3_1.default(0, 1, 0), 135);
    scene.add(mesh);
    camera.target.set(0, 0, 1);
});

})();

/******/ })()
;
//# sourceMappingURL=example3.bundle.js.map