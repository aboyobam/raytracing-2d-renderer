import Face from "@/Face";
import Vector3 from "@/Vector3";
import Optimizer from "./Optimizer";
import Scene from "@/Scene";

export default class NoopOptimizer implements Optimizer {
    constructor(private scene: Scene) {}
    
    *intersects(_origin: Vector3, _dir: Vector3): Iterable<Face> {
        for (const mesh of this.scene.meshes) {
            for (const face of mesh.geometry.faces) {
                yield face;
            }
        }
    }
}