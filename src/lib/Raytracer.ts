import Face from "./Face";
import Mesh from "./Mesh";
import Scene from "./Scene";
import Vector3 from "./Vector3";

export default class Raytracer {
    constructor(private readonly scene: Scene, public readonly origin: Vector3) {};

    *castRay(dir: Vector3): IterableIterator<Intersection> {
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

export interface Intersection {
    angle: number;
    point: Vector3;
    distance: number;
    mesh: Mesh;
    face: Face;
}