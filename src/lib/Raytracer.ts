import Camera from "./Camera";
import Face from "./Face";
import Mesh from "./Mesh";
import Scene from "./Scene";
import Vector3 from "./Vector3";
import Octree from "./optimizer/Octree/Octree";
import QuadTree from "./optimizer/PlanarQuadTree/QuadTree";
import { rendererConfig } from "./setup";

export default class Raytracer {
    static readonly EPSILON = 1e-9;

    private readonly qt: QuadTree;
    private readonly ot: Octree;

    constructor(public readonly scene: Scene, public readonly camera: Camera) {
        if (rendererConfig.optimizer?.type == "qt") {
            this.qt = QuadTree.ofScene(scene, camera);
        }

        if (rendererConfig.optimizer?.type == "ot") {
            this.ot = new Octree(scene);
            // this.ot.print();
        }
    }

    *castRay(origin: Vector3, dir: Vector3): IterableIterator<Intersection> {
        const normDir = dir.norm();

        if (!rendererConfig.optimizer) {
            for (const mesh of this.scene) {
                for (const origFace of mesh.geometry.faces) {
                    yield* this.checkRay(mesh, origFace, origin, normDir);
                }
            }
        } else if (this.qt) {
            for (const [mesh, face] of this.qt.intersects(normDir)) {
                yield* this.checkRay(mesh, face, origin, normDir);
            }
        } else if (this.ot) {
            for (const [mesh, face] of this.ot.intersects(origin, normDir)) {
                yield* this.checkRay(mesh, face, origin, normDir);
            }
        }
    }

    intersectOrder(origin: Vector3, dir: Vector3, filter = () => true): Intersection[] {
        return Array.from(this.castRay(origin, dir)).sort((a, b) => a.distance - b.distance);
    }

    private *checkRay(mesh: Mesh, face: Face, origin: Vector3, normDir: Vector3): IterableIterator<Intersection> {
        // Möller–Trumbore
        const edge1 = face.v.sub(face.u);
        const edge2 = face.w.sub(face.u);
        const h = normDir.cross(edge2);
        const a = edge1.dot(h);
        
        if (a > -Raytracer.EPSILON && a < Raytracer.EPSILON) {
            return;
        }

        const f = 1.0 / a;
        const s = origin.sub(face.u);
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
            const point = origin.add(normDir.multScalar(t));
            const dotProduct = normDir.dot(face.normal);
            const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct));
            const angle = Math.acos(clampedDotProduct) * (180 / Math.PI);
            const distance = origin.sub(point).len();
            const reflectionAdjustment = face.normal.multScalar(2 * dotProduct);
            const outDir = normDir.sub(reflectionAdjustment).norm();

            let edgeDist = 0;
            if (rendererConfig.renderer.type == "wireframe") {
                const dist1 = this.distancePointToSegment(point, face.u, face.v);
                const dist2 = this.distancePointToSegment(point, face.v, face.w);
                const dist3 = this.distancePointToSegment(point, face.w, face.u);
                edgeDist = Math.min(dist1, dist2, dist3);
            }

            yield { angle, point, distance, mesh, face, edgeDist, outDir };
        }
    }

    private distancePointToSegment(point: Vector3, a: Vector3, b: Vector3): number {
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

export interface Intersection {
    angle: number;
    point: Vector3;
    distance: number;
    mesh: Mesh;
    face: Face;
    edgeDist: number;
    outDir: Vector3;
}