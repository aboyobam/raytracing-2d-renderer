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
        this.fov = fov;
        this.aspectRatio = aspectRatio;
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
    constructor(u, v, w, normal) {
        this.u = u;
        this.v = v;
        this.w = w;
        this.normal = normal;
    }
    ;
    clone() {
        return new Face(this.u.clone(), this.v.clone(), this.w.clone(), this.normal);
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
    a = 256;
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
    constructor(scene, origin) {
        this.scene = scene;
        this.origin = origin;
    }
    ;
    *castRay(dir) {
        for (const mesh of this.scene) {
            for (const origFace of mesh.geometry.faces) {
                const face = origFace.clone().translate(mesh.worldPosition);
                const edge1 = face.v.sub(face.u);
                const edge2 = face.w.sub(face.u);
                const h = dir.cross(edge2);
                const a = edge1.dot(h);
                const EPSILON = 0.0000001;
                if (a > -EPSILON && a < EPSILON) {
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
                if (t > EPSILON) {
                    const intersectionPoint = this.origin.add(dir.multScalar(t));
                    const dotProduct = dir.dot(face.normal);
                    const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct));
                    const angle = Math.acos(clampedDotProduct) * (180 / Math.PI);
                    const distance = this.origin.sub(intersectionPoint).len();
                    yield {
                        angle,
                        point: intersectionPoint,
                        distance,
                        mesh,
                        face
                    };
                }
            }
        }
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
const Raytracer_1 = __webpack_require__(/*! ./Raytracer */ "./src/lib/Raytracer.ts");
class Renderer {
    width;
    height;
    canvas;
    renderer;
    rendererCtx;
    canvasCtx;
    imageData;
    needsUpdate = false;
    constructor(width, height, scale) {
        this.width = width;
        this.height = height;
        this.renderer = new OffscreenCanvas(width, height);
        this.rendererCtx = this.renderer.getContext("2d");
        this.canvas = document.createElement("canvas");
        this.canvasCtx = this.canvas.getContext("2d");
        this.canvas.width = width * scale;
        this.canvas.height = height * scale;
        this.imageData = this.rendererCtx.getImageData(0, 0, width, height);
    }
    get pixels() {
        return this.imageData.data;
    }
    setPixel(x, y, r, g, b) {
        const index = (y * this.width + x) * 4;
        const pixels = this.pixels;
        pixels[index + 0] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = 256;
        this.needsUpdate = true;
    }
    animate() {
        const loop = () => {
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    draw() {
        if (this.needsUpdate) {
            this.rendererCtx.putImageData(this.imageData, 0, 0);
            this.needsUpdate = false;
        }
        this.canvasCtx.imageSmoothingEnabled = false;
        this.canvasCtx.drawImage(this.renderer, 0, 0, this.canvas.width, this.canvas.height);
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
        const xStep = topRight.sub(topLeft).multScalar(1 / this.width);
        const yStep = bottomLeft.sub(topLeft).multScalar(1 / this.height);
        const rc = new Raytracer_1.default(scene, camera.position);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const dir = topLeft
                    .add(xStep.multScalar(x))
                    .add(yStep.multScalar(y))
                    .sub(camera.position)
                    .norm();
                const [first, ...hits] = rc.castRay(dir);
                if (!first) {
                    continue;
                }
                let closest = first;
                for (const hit of hits) {
                    if (hit.distance < closest.distance) {
                        closest = hit;
                    }
                }
                this.setPixel(x, y, 0, 0, (255 * (closest.angle / 180)));
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
/*!*************************!*\
  !*** ./src/example1.ts ***!
  \*************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Camera_1 = __webpack_require__(/*! ./lib/Camera */ "./src/lib/Camera.ts");
const Material_1 = __webpack_require__(/*! ./lib/Material */ "./src/lib/Material.ts");
const Mesh_1 = __webpack_require__(/*! ./lib/Mesh */ "./src/lib/Mesh.ts");
const Renderer_1 = __webpack_require__(/*! ./lib/Renderer */ "./src/lib/Renderer.ts");
const Scene_1 = __webpack_require__(/*! ./lib/Scene */ "./src/lib/Scene.ts");
const Vector3_1 = __webpack_require__(/*! ./lib/Vector3 */ "./src/lib/Vector3.ts");
const CubeGeometry_1 = __webpack_require__(/*! ./lib/geometries/CubeGeometry */ "./src/lib/geometries/CubeGeometry.ts");
const scene = new Scene_1.default();
const renderer = new Renderer_1.default(200, 160, 2);
const camera = new Camera_1.default(45, renderer.width / renderer.height, 2);
document.body.appendChild(renderer.canvas);
const geo = new CubeGeometry_1.default(10, 10, 10);
const mat = new Material_1.default();
const mesh = new Mesh_1.default(geo, mat);
mesh.position.set(0, 0, 30);
scene.add(mesh);
renderer.animate();
mesh.rotate(new Vector3_1.default(0, 1, 0), 45);
camera.target.set(0, 0, 1);
renderer.render(camera, scene);
setInterval(() => {
    mesh.rotate(new Vector3_1.default(0, 1, 0), 10);
    renderer.render(camera, scene);
}, 200);

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map