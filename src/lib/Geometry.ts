import Face from "./Face";
import Vector3 from "./Vector3";

export default class Geometry {
    constructor(public readonly vertecies: Vector3[], public readonly faces: Face[]) {}
}