import Object3D from "./Object3D";
import Vector3 from "./Vector3";

export default class Light extends Object3D {
    public target = new Vector3(0, 0, 1);

    constructor(public readonly intensity: number, public readonly distance: number, public readonly decay: number) {
        super();
    };
}