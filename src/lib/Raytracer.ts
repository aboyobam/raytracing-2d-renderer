import Face from "./Face";
import Mesh from "./Mesh";
import Scene from "./Scene";
import Vector3 from "./Vector3";
import Octree from "./optimizer/Octree/Octree";

export default class Raytracer {
    static readonly EPSILON = 1e-9;

    private readonly ot: Octree;

    constructor(public readonly scene: Scene) {
        this.ot = new Octree(scene);
    }

    *castRay(origin: Vector3, dir: Vector3): IterableIterator<Intersection> {
        const normDir = dir.norm();

        for (const [mesh, face] of this.ot.intersects(origin, normDir)) {
            yield* this.checkRay(mesh, face, origin, normDir);
        }
    }

    intersectOrder(origin: Vector3, dir: Vector3): Intersection[] {
        return Array.from(this.castRay(origin, dir)).sort((a, b) => a.distance - b.distance);
    }

    private *checkRay(mesh: Mesh, face: Face, origin: Vector3, normDir: Vector3): IterableIterator<Intersection> {
        origin = origin.add(normDir.multScalar(Raytracer.EPSILON));

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
            let outDir = normDir.sub(reflectionAdjustment).norm();

            let edgeDist = 0;
            /*if (rendererConfig.renderer.type == "wireframe") {
                const dist1 = this.distancePointToSegment(point, face.u, face.v);
                const dist2 = this.distancePointToSegment(point, face.v, face.w);
                const dist3 = this.distancePointToSegment(point, face.w, face.u);
                edgeDist = Math.min(dist1, dist2, dist3);
            }*/

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