import Face from "./Face";
import Vector3 from "./Vector3";

export default class Geometry {
    public readonly faces: Face[];

    constructor(private readonly vertecies: Vector3[], faces: Face[]) {
        this.faces = faces.map(face => face.clone());
    }

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