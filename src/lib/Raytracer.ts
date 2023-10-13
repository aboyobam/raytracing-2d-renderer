import Decimal from "decimal.js";
import Camera from "./Camera";
import Face from "./Face";
import Mesh from "./Mesh";
import Scene from "./Scene";
import Vector3 from "./Vector3";
import Octree from "./optimizer/Octree/Octree";
import QuadTree from "./optimizer/PlanarQuadTree/QuadTree";
import { rendererConfig } from "./setup";

export default class Raytracer {
    static readonly EPSILON = 1e-7;

    private readonly qt: QuadTree;
    private readonly ot: Octree;

    constructor(private readonly scene: Scene, public readonly camera: Camera) {
        if (rendererConfig.optimizer?.type == "qt") {
            if (rendererConfig.hasLight) {
                throw new Error("Lighting is not supported with the QuadTree optimizer");
            }
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

    intersectOrder(origin: Vector3, dir: Vector3): Intersection[] {
        return Array.from(this.castRay(origin, dir)).sort((a, b) => a.distance.sub(b.distance).toNumber());
    }

    private *checkRay(mesh: Mesh, face: Face, origin: Vector3, normDir: Vector3): IterableIterator<Intersection> {
        // Möller–Trumbore
        const edge1 = face.v.sub(face.u);
        const edge2 = face.w.sub(face.u);
        const h = normDir.cross(edge2);
        const a = edge1.dot(h);
        
        if (a.gt(-Raytracer.EPSILON) && a.lt(Raytracer.EPSILON)) {
            return;
        }

        const f = new Decimal(1).div(a);
        const s = origin.sub(face.u);
        const u = f.mul(s.dot(h));
        if (u.lt(0) || u.gt(1)) {
            return;
        }
            
        const q = s.cross(edge1);
        const v = f.mul(normDir.dot(q));
        if (v.lt(0) || u.add(v).gt(1)) {
            return;
        }

        const t = f.mul(edge2.dot(q));
        if (t.gt(Raytracer.EPSILON)) {
            const point = origin.add(normDir.multScalar(t));
            const dotProduct = normDir.dot(face.normal);
            const clampedDotProduct = Decimal.clamp(-1, dotProduct, 1);
            const angle = Decimal.acos(clampedDotProduct).mul(180 / Math.PI);
            const distance = origin.sub(point).len();

            const dist1 = this.distancePointToSegment(point, face.u, face.v);
            const dist2 = this.distancePointToSegment(point, face.v, face.w);
            const dist3 = this.distancePointToSegment(point, face.w, face.u);
            const edgeDist = Decimal.min(dist1, dist2, dist3);

            yield { angle, point, distance, mesh, face, edgeDist };
        }
    }

    private distancePointToSegment(point: Vector3, a: Vector3, b: Vector3): Decimal {
        const ab = b.sub(a);
        const ap = point.sub(a);
        const bp = point.sub(b);
        const e = ap.dot(ab);
        
        if (e.lte(0)) {
            return ap.len();
        }

        const f = ab.dot(ab);
        if (e.gte(f)) {
            return bp.len();
        }
    
        return Decimal.sqrt(ap.dot(ap).sub(e.mul(e)).div(f));
    }
}

export interface Intersection {
    angle: Decimal;
    point: Vector3;
    distance: Decimal;
    mesh: Mesh;
    face: Face;
    edgeDist: Decimal;
}