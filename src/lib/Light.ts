import Object3D from "./Object3D";
import Vector3 from "./Vector3";
import serializable from "./serializable";

@serializable("Light")
export default class Light extends Object3D {
    public target = new Vector3(0, 0, 1);

    color: [number, number, number] = [1, 1, 1];

    constructor(public readonly intensity: number, public readonly distance: number, public readonly decay: number) {
        super();
    };
}