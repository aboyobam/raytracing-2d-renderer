import Face from "@/Face";
import Vector3 from "@/Vector3";

export default interface Optimizer {
    intersects(origin: Vector3, dir: Vector3): Iterable<Face>;
}