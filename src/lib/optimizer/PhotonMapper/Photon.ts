import Vector3 from "@/Vector3";
import serializable from "@/serializable";

@serializable("Photon")
export default class Photon {
    constructor(public readonly position: Vector3, public readonly color: ColorLike) {}
}