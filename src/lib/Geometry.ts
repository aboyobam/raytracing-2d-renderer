import Face from "./Face";
import Vector3 from "./Vector3";

export default class Geometry {
    constructor(public readonly vertecies: Vector3[], public readonly faces: Face[]) {}

    getBoundingBox() {
        let min = new Vector3(Infinity, Infinity, Infinity);
        let max = new Vector3(-Infinity, -Infinity, -Infinity);
    
        for (const face of this.faces) {
            const [bbMin, bbMax] = face.getBoundingBox();

            min = Vector3.min(bbMin, min);
            max = Vector3.max(bbMax, max);
        }

        return [min, max] as const;
    }
}