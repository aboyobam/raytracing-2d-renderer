import Face from "./Face";
import Vector3 from "./Vector3";
import serializable from "./serializable";

@serializable("Geometry")
export default class Geometry {
    public readonly faces: Face[];

    constructor(faces: Face[]) {
        this.faces = faces.map(face => face.clone());
    }

    getBoundingBox(): [Vector3, Vector3] {
        let min = new Vector3(Infinity, Infinity, Infinity);
        let max = new Vector3(-Infinity, -Infinity, -Infinity);
    
        for (const face of this.faces) {
            const [bbMin, bbMax] = face.getBoundingBox();

            min = Vector3.min(bbMin, min);
            max = Vector3.max(bbMax, max);
        }

        return [min, max];
    }
}