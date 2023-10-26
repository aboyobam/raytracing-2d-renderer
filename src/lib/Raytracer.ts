import Face from "./Face";
import Scene from "./Scene";
import Vector3 from "./Vector3";
import intersectsBounds from "./intersects-bounds";
import BVHOptimizer from "./optimizer/BVH/BVH";
import OctreeOptimizer from "./optimizer/Octree/Octree";
import Optimizer from "./optimizer/Optimizer";

type Backfaces = "none" | "only" | "both";

export default class Raytracer {
    static readonly EPSILON = 1e-9;

    private readonly optimizer: Optimizer;

    constructor(public readonly scene: Scene) {
        // this.optimizer = new OctreeOptimizer(scene);
        this.optimizer = new BVHOptimizer(scene);
    }

    *castRay(origin: Vector3, dir: Vector3, backfaces: Backfaces = "none"): IterableIterator<Intersection> {
        const normDir = dir.norm();

        for (const face of this.optimizer.intersects(origin, normDir)) {
            // if (!intersectsBounds(origin, normDir, ...face.getBoundingBox())) {
            //     continue;
            // }

            if (backfaces !== "both") {
                const dot = normDir.dot(face.normal);

                if (backfaces === "none") {
                    if (dot > 0) {
                        continue;
                    }
                } else if (backfaces === "only") {
                    if (dot < 0) {
                        continue;
                    }
                }
            }

            const hit = this.checkRay(face, origin, normDir);
            if (hit) {
                yield hit;
            }
        }
    }

    intersectOrder(origin: Vector3, dir: Vector3, backfaces: Backfaces = "none"): Intersection[] {
        return Array.from(this.castRay(origin, dir, backfaces)).sort((a, b) => a.distance - b.distance);
    }

    private checkRay(face: Face, origin: Vector3, normDir: Vector3): Intersection {
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
            const gamma = 1 - u - v;
            const normal = (!face.uN || !face.vN || !face.wN) ? face.normal :
                face.uN.multScalar(gamma).add(face.vN.multScalar(u)).add(face.wN.multScalar(v)).norm();

            const dotProduct = normDir.dot(normal);
            const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct));
            const angle = Math.acos(clampedDotProduct) * (180 / Math.PI);
            const distance = origin.sub(point).len();
            const reflectionAdjustment = normal.multScalar(2 * dotProduct);
            const outDir = normDir.sub(reflectionAdjustment).norm();

            // face.material.name === "glass" && Math.random() < 0.00005 && console.log(
            //     face.uN.pretty() + "\n" +
            //     face.vN.pretty() + "\n" +
            //     face.wN.pretty() + "\n" +
            //     // face.uN.multScalar(gamma).add(face.vN.multScalar(u)).add(face.wN.multScalar(v)).norm().pretty() + "\n" + 
            //     face.normal.pretty()
            // );
    
            return { angle, point, distance, face, outDir, normal };
        }
    }
}

export interface Intersection {
    angle: number;
    point: Vector3;
    distance: number;
    face: Face;
    outDir: Vector3;
    normal: Vector3;
}