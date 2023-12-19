import Face from "./Face";
import Object3D from "./Object3D";
import serializable from "./serializable";

@serializable("Light")
export default class Light extends Object3D {
    color: ColorLike = [1, 1, 1];
    ignoreIndirect: boolean;
    fromFace: Face;
    indirect: boolean;

    constructor(public readonly intensity: number, public readonly distance: number, public readonly decay: number) {
        super();
    };
}