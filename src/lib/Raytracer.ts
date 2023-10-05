import Face from "./Face";
import Mesh from "./Mesh";
import Scene from "./Scene";
import Vector3 from "./Vector3";

export default class Raytracer {
    static readonly EPSILON = 1e-7
    constructor(private readonly scene: Scene, public readonly origin: Vector3) {};

    *castRay(dir: Vector3): IterableIterator<Intersection> {
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
}