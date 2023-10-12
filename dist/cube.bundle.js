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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Vector3_1 = __webpack_require__(/*! ./Vector3 */ "./src/lib/Vector3.ts");
class Face {
    u;
    v;
    w;
    normal;
    material;
    static counter = 0;
    name;
    constructor(u, v, w, normal, material, name) {
        this.u = u;
        this.v = v;
        this.w = w;
        this.normal = normal;
        this.material = material;
        this.name = (Face.counter++) + "_" + (name || "Face");
    }
    ;
    clone() {
        return new Face(this.u.clone(), this.v.clone(), this.w.clone(), this.normal, this.material, this.name + "_cloned");
    }
    getBoundingBox() {
        return [
            new Vector3_1.default(Math.min(this.u.x, this.v.x, this.w.x), Math.min(this.u.y, this.v.y, this.w.y), Math.min(this.u.z, this.v.z, this.w.z)),
            new Vector3_1.default(Math.max(this.u.x, this.v.x, this.w.x), Math.max(this.u.y, this.v.y, this.w.y), Math.max(this.u.z, this.v.z, this.w.z))
        ];
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
    name;
    static all = {};
    constructor(r = 256, g = 256, b = 256, a = 256, name) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.name = name;
        if (name) {
            Material.all[name] = this;
        }
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
const Object3D_1 = __webpack_require__(/*! ./Object3D */ "./src/lib/Object3D.ts");
class Mesh extends Object3D_1.default {
    geometry;
    material;
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
    ;
    children = [];
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
}
exports["default"] = Mesh;


/***/ }),

/***/ "./src/lib/Object3D.ts":
/*!*****************************!*\
  !*** ./src/lib/Object3D.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Vector3_1 = __webpack_require__(/*! ./Vector3 */ "./src/lib/Vector3.ts");
class Object3D {
    parent;
    position = new Vector3_1.default(0, 0, 0);
    get worldPosition() {
        if (this.parent) {
            return this.parent.worldPosition.add(this.position);
        }
        else {
            return this.position;
        }
    }
}
exports["default"] = Object3D;


/***/ }),

/***/ "./src/lib/Raytracer.ts":
/*!******************************!*\
  !*** ./src/lib/Raytracer.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const QuadTree_1 = __webpack_require__(/*! ./optimizer/QuadTree */ "./src/lib/optimizer/QuadTree.ts");
const setup_1 = __webpack_require__(/*! ./setup */ "./src/lib/setup.ts");
class Raytracer {
    scene;
    camera;
    static EPSILON = 1e-7;
    qt;
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        if (setup_1.rendererConfig.qtEnabled) {
            this.qt = QuadTree_1.default.ofScene(scene, camera);
            this.qt.print();
        }
    }
    *castRay(dir) {
        const normDir = dir.sub(this.camera.position).norm();
        if (setup_1.rendererConfig.qtEnabled) {
            for (const [mesh, face] of this.qt.intersects(dir)) {
                yield* this.checkRay(mesh, face, normDir);
            }
        }
        else {
            for (const mesh of this.scene) {
                for (const origFace of mesh.geometry.faces) {
                    const face = origFace.clone().translate(mesh.worldPosition);
                    yield* this.checkRay(mesh, face, normDir);
                }
            }
        }
    }
    *checkRay(mesh, face, normDir) {
        // Möller–Trumbore
        const edge1 = face.v.sub(face.u);
        const edge2 = face.w.sub(face.u);
        const h = normDir.cross(edge2);
        const a = edge1.dot(h);
        if (a > -Raytracer.EPSILON && a < Raytracer.EPSILON) {
            return;
        }
        const f = 1.0 / a;
        const s = this.camera.position.sub(face.u);
        const u = f * s.dot(h);
        if (u < 0.0 || u > 1.0) {
            return;
        }
        const q = s.cross(edge1);
        const v = f * normDir.dot(q);
        if (v < 0.0 || u + v > 1.0) {
            return;
        }
        const t = f * edge2.dot(q);
        if (t > Raytracer.EPSILON) {
            const point = this.camera.position.add(normDir.multScalar(t));
            const dotProduct = normDir.dot(face.normal);
            const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct));
            const angle = Math.acos(clampedDotProduct) * (180 / Math.PI);
            const distance = this.camera.position.sub(point).len();
            const dist1 = this.distancePointToSegment(point, face.u, face.v);
            const dist2 = this.distancePointToSegment(point, face.v, face.w);
            const dist3 = this.distancePointToSegment(point, face.w, face.u);
            const edgeDist = Math.min(dist1, dist2, dist3);
            yield { angle, point, distance, mesh, face, edgeDist };
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
    pixels;
    constructor(config, buffer, mod, total) {
        this.config = config;
        this.buffer = buffer;
        this.mod = mod;
        this.total = total;
        this.pixels = new Uint8ClampedArray(buffer);
    }
    setPixel(x, y, r, g, b, a = 256) {
        const index = (y * this.config.width + x) * 4;
        const pixels = this.pixels;
        pixels[index + 0] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = a;
    }
    render(camera, scene) {
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
        const rc = new Raytracer_1.default(scene, camera);
        for (let y = this.mod; y < this.config.height; y += this.total) {
            for (let x = 0; x < this.config.width; x++) {
                const dir = topLeft
                    .add(xStep.multScalar(x))
                    .add(yStep.multScalar(y));
                const hits = Array.from(rc.castRay(dir));
                if (!hits.length) {
                    this.setPixel(x, y, 200, 200, 200);
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
                    this.setPixel(x, y, r, g, b, a);
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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Object3D_1 = __webpack_require__(/*! ./Object3D */ "./src/lib/Object3D.ts");
class Scene extends Object3D_1.default {
    meshes = [];
    add(...objs) {
        for (const obj of objs) {
            this.meshes.push(obj);
            obj.parent = this;
        }
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
    static midpoint(a, b) {
        return a.add(b).multScalar(1 / 2);
    }
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
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
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
            new Face_1.default(vertecies[2], vertecies[3], vertecies[6], new Vector3_1.default(0, 1, 0), null, "cube_top_1"),
            new Face_1.default(vertecies[3], vertecies[6], vertecies[7], new Vector3_1.default(0, 1, 0), null, "cube_top_2"),
            new Face_1.default(vertecies[0], vertecies[1], vertecies[4], new Vector3_1.default(0, -1, 0), null, "cube_bottom_1"),
            new Face_1.default(vertecies[1], vertecies[4], vertecies[5], new Vector3_1.default(0, -1, 0), null, "cube_bottom_2"),
            new Face_1.default(vertecies[0], vertecies[1], vertecies[2], new Vector3_1.default(-1, 0, 0), null, "cube_left_1"),
            new Face_1.default(vertecies[1], vertecies[2], vertecies[3], new Vector3_1.default(-1, 0, 0), null, "cube_left_2"),
            new Face_1.default(vertecies[4], vertecies[5], vertecies[6], new Vector3_1.default(1, 0, 0), null, "cube_right_1"),
            new Face_1.default(vertecies[5], vertecies[6], vertecies[7], new Vector3_1.default(1, 0, 0), null, "cube_right_2"),
            new Face_1.default(vertecies[0], vertecies[2], vertecies[4], new Vector3_1.default(0, 0, -1), null, "cube_front_1"),
            new Face_1.default(vertecies[2], vertecies[4], vertecies[6], new Vector3_1.default(0, 0, -1), null, "cube_front_2"),
            new Face_1.default(vertecies[1], vertecies[3], vertecies[5], new Vector3_1.default(0, 0, 1), null, "cube_back_1"),
            new Face_1.default(vertecies[3], vertecies[5], vertecies[7], new Vector3_1.default(0, 0, 1), null, "cube_back_2"), // back
        ]);
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
}
exports["default"] = CubeGeometry;


/***/ }),

/***/ "./src/lib/optimizer/QuadNode.ts":
/*!***************************************!*\
  !*** ./src/lib/optimizer/QuadNode.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Vector3_1 = __webpack_require__(/*! @/Vector3 */ "./src/lib/Vector3.ts");
const QuadTree_1 = __webpack_require__(/*! ./QuadTree */ "./src/lib/optimizer/QuadTree.ts");
class QuadNode {
    tree;
    corners;
    entries = [];
    children = [];
    constructor(tree, corners) {
        this.tree = tree;
        this.corners = corners;
    }
    get topRight() { return this.corners[0]; }
    ;
    get bottomRight() { return this.corners[1]; }
    ;
    get bottomLeft() { return this.corners[2]; }
    ;
    get topLeft() { return this.corners[3]; }
    ;
    overlaps(vertex) {
        const normal = this.bottomLeft.sub(this.topLeft).cross(this.topRight.sub(this.topLeft)).norm();
        const d = this.topLeft.dot(normal);
        const t = (d - this.tree.camera.position.dot(normal)) / vertex.dot(normal);
        const intersection = this.tree.camera.position.add(vertex.multScalar(t));
        const withinX = Math.min(this.topLeft.x, this.bottomRight.x) <= intersection.x && intersection.x <= Math.max(this.topLeft.x, this.bottomRight.x);
        const withinY = Math.min(this.topLeft.y, this.bottomRight.y) <= intersection.y && intersection.y <= Math.max(this.topLeft.y, this.bottomRight.y);
        const withinZ = Math.min(this.topLeft.z, this.bottomRight.z) <= intersection.z && intersection.z <= Math.max(this.topLeft.z, this.bottomRight.z);
        return withinX && withinY && withinZ;
    }
    overlapsFace(face) {
        const normal = this.bottomLeft.sub(this.topLeft).cross(this.topRight.sub(this.topLeft)).norm();
        const [min, max] = face.getBoundingBox();
        const vertex = Vector3_1.default.midpoint(min, max);
        const d = this.topLeft.dot(normal);
        const t = (d - this.tree.camera.position.dot(normal)) / vertex.dot(normal);
        const intersection = this.tree.camera.position.add(vertex.multScalar(t));
        const [m, x] = face.clone().translate(intersection.sub(vertex)).getBoundingBox();
        const withinX = Math.min(this.topLeft.x, this.bottomRight.x) <= x.x && m.x <= Math.max(this.topLeft.x, this.bottomRight.x);
        const withinY = Math.min(this.topLeft.y, this.bottomRight.y) <= x.y && m.y <= Math.max(this.topLeft.y, this.bottomRight.y);
        const withinZ = Math.min(this.topLeft.z, this.bottomRight.z) <= x.z && m.z <= Math.max(this.topLeft.z, this.bottomRight.z);
        // const withinX = (m.x - 0.00001) <= intersection.x && (x.x + 0.00001) >= intersection.x;
        // const withinY = (m.y - 0.00001) <= intersection.y && (x.y + 0.00001) >= intersection.y;
        // const withinZ = (m.z - 0.00001) <= intersection.z && (x.z + 0.00001) >= intersection.z;
        const matches = withinX && withinY && withinZ;
        return matches;
    }
    insert(mesh, face) {
        if (this.children.length) {
            let allMatched = true;
            let oneMatched = false;
            for (const child of this.children) {
                const matched = child.insert(mesh, face);
                oneMatched ||= matched;
                if (!matched) {
                    allMatched = false;
                }
            }
            if (allMatched) {
                this.entries.push([mesh, face]);
                for (const child of this.children) {
                    const index = child.entries.findIndex(([_, iFace]) => face === iFace);
                    if (index > -1) {
                        child.entries.splice(index, 1);
                    }
                }
            }
            return oneMatched;
        }
        if (this.overlapsFace(face)) {
            const size = this.entries.push([mesh, face]);
            if (size >= QuadTree_1.default.MAX_COUNT) {
                this.subdivide();
            }
            return true;
        }
        /*if (this.overlaps(face.u) || this.overlaps(face.w) || this.overlaps(face.v)) {
            const size = this.entries.push([mesh, face]);

            if (size >= QuadTree.MAX_COUNT) {
                this.subdivide();
            }

            return true;
        }*/
        return false;
    }
    subdivide() {
        const [topRight, bottomRight, bottomLeft, topLeft] = this.corners;
        const topMid = Vector3_1.default.midpoint(topRight, topLeft);
        const rightMid = Vector3_1.default.midpoint(topRight, bottomRight);
        const bottomMid = Vector3_1.default.midpoint(bottomRight, bottomLeft);
        const leftMid = Vector3_1.default.midpoint(topLeft, bottomLeft);
        const center = Vector3_1.default.midpoint(Vector3_1.default.midpoint(topMid, bottomMid), Vector3_1.default.midpoint(rightMid, leftMid));
        this.children.push(new QuadNode(this.tree, [topRight, rightMid, center, topMid]), new QuadNode(this.tree, [rightMid, bottomRight, bottomMid, center]), new QuadNode(this.tree, [center, bottomMid, bottomLeft, leftMid]), new QuadNode(this.tree, [topMid, center, leftMid, topLeft]));
    }
    *intersects(dir) {
        if (!this.overlaps(dir)) {
            return;
        }
        yield* this.entries;
        for (const child of this.children) {
            yield* child.intersects(dir);
        }
    }
    print(indent = 0) {
        const sep = "  ";
        const parts = [];
        parts.push("Conners:");
        parts.push(sep + `topLeft: (${this.topLeft.x.toFixed(3)}, ${this.topLeft.y.toFixed(3)}, ${this.topLeft.z.toFixed(3)})`);
        parts.push(sep + `topLeft: (${this.topRight.x.toFixed(3)}, ${this.topRight.y.toFixed(3)}, ${this.topRight.z.toFixed(3)})`);
        parts.push(sep + `topLeft: (${this.bottomLeft.x.toFixed(3)}, ${this.bottomLeft.y.toFixed(3)}, ${this.bottomLeft.z.toFixed(3)})`);
        parts.push(sep + `topLeft: (${this.bottomRight.x.toFixed(3)}, ${this.bottomRight.y.toFixed(3)}, ${this.bottomRight.z.toFixed(3)})`);
        if (this.entries.length) {
            parts.push("Entries:");
            if (this.entries.length > 10) {
                parts.push(sep + this.entries.length + " entries");
            }
            else {
                for (const entry of this.entries) {
                    parts.push(sep + entry[1].name);
                }
            }
        }
        if (this.children.length && this.children.some(child => child.entries.length)) {
            parts.push("Children:");
            for (const child of this.children) {
                parts.push(child.print(indent + 1));
            }
        }
        return parts.map(p => sep.repeat(indent) + p).join("\n");
    }
}
exports["default"] = QuadNode;


/***/ }),

/***/ "./src/lib/optimizer/QuadTree.ts":
/*!***************************************!*\
  !*** ./src/lib/optimizer/QuadTree.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const QuadNode_1 = __webpack_require__(/*! ./QuadNode */ "./src/lib/optimizer/QuadNode.ts");
class QuadTree {
    camera;
    static MAX_COUNT;
    root;
    static ofScene(scene, camera) {
        const qt = new QuadTree(camera);
        for (const mesh of scene) {
            qt.insert(mesh);
        }
        return qt;
    }
    constructor(camera) {
        this.camera = camera;
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
        const bottomRight = center.sub(halfUp).add(halfRight);
        this.root = new QuadNode_1.default(this, [topRight, bottomRight, bottomLeft, topLeft]);
    }
    insert(mesh) {
        for (const origFace of mesh.geometry.faces) {
            const face = origFace.clone().translate(mesh.worldPosition);
            this.root.insert(mesh, face);
        }
    }
    *intersects(dir) {
        yield* this.root.intersects(dir);
    }
    print() {
        console.log(this.root.print());
    }
}
exports["default"] = QuadTree;


/***/ }),

/***/ "./src/lib/setup.ts":
/*!**************************!*\
  !*** ./src/lib/setup.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rendererConfig = void 0;
const Camera_1 = __webpack_require__(/*! ./Camera */ "./src/lib/Camera.ts");
const Renderer_1 = __webpack_require__(/*! ./Renderer */ "./src/lib/Renderer.ts");
const Scene_1 = __webpack_require__(/*! ./Scene */ "./src/lib/Scene.ts");
const QuadTree_1 = __webpack_require__(/*! ./optimizer/QuadTree */ "./src/lib/optimizer/QuadTree.ts");
let _buildScene;
let _data;
let ready = false;
exports.rendererConfig = {};
self.onmessage = ({ data: { type, data } }) => {
    if (type == "config") {
        _data = data;
        Object.assign(exports.rendererConfig, _data.config);
        QuadTree_1.default.MAX_COUNT = _data.config.qtMaxSize;
        if (_buildScene) {
            doSetup();
        }
    }
    else if (type == "render") {
        ready = true;
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
    await _buildScene({ scene, camera, renderer, config: _data.config });
    if (_data.config.threadSync) {
        await new Promise((resolve) => {
            self.postMessage("ready");
            const iv = setInterval(() => {
                if (ready) {
                    clearInterval(iv);
                    return resolve();
                }
            });
        });
    }
    scene.position.copy(camera.position.multScalar(-1));
    camera.position.set(0, 0, 0);
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
/*!****************************!*\
  !*** ./src/scenes/cube.ts ***!
  \****************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Material_1 = __webpack_require__(/*! @/Material */ "./src/lib/Material.ts");
const Mesh_1 = __webpack_require__(/*! @/Mesh */ "./src/lib/Mesh.ts");
const Vector3_1 = __webpack_require__(/*! @/Vector3 */ "./src/lib/Vector3.ts");
const CubeGeometry_1 = __webpack_require__(/*! @/geometries/CubeGeometry */ "./src/lib/geometries/CubeGeometry.ts");
const setup_1 = __webpack_require__(/*! @/setup */ "./src/lib/setup.ts");
(0, setup_1.default)(({ scene, camera }) => {
    const geo = new CubeGeometry_1.default(10, 10, 10);
    const mat = new Material_1.default(256, 0, 0, 120);
    const mesh = new Mesh_1.default(geo, mat);
    mesh.position.set(-2, -0, 30);
    scene.add(mesh);
    mesh.rotate(new Vector3_1.default(0, 1, 0), 30);
    mesh.rotate(new Vector3_1.default(1, 0, 0), 30);
    camera.target.set(0, 0, 1);
});

})();

/******/ })()
;
//# sourceMappingURL=cube.bundle.js.map