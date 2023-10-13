import Geometry from "@/Geometry";
import Vector3 from "@/Vector3";

export default class PlaneGeometry extends Geometry {
    constructor(public readonly topLeft: Vector3, public readonly bottomRight: Vector3) {
        super([], [])
    }
}