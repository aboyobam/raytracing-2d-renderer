import Face from "../Face";
import Geometry from "../Geometry";
import Vector3 from "../Vector3";

export default class CubeGeometry extends Geometry {
    constructor(public readonly width: number, public readonly height: number, public readonly depth: number) {
        const vertecies: Vector3[] = [];
        
        for (const x of [-0.5, 0.5]) {
            for (const y of [-0.5, 0.5]) {
                for (const z of [-0.5, 0.5]) {
                    vertecies.push(new Vector3(width * x, height * y, depth * z));
                }
            }
        }
        
        super(vertecies, [
            new Face(vertecies[0], vertecies[1], vertecies[4], new Vector3(0, -1, 0)), new Face(vertecies[1], vertecies[4], vertecies[5], new Vector3(0, -1, 0)), // bottom
            new Face(vertecies[2], vertecies[3], vertecies[6], new Vector3(0, 1, 0)), new Face(vertecies[3], vertecies[6], vertecies[7], new Vector3(0, 1, 0)), // top
            new Face(vertecies[0], vertecies[1], vertecies[2], new Vector3(-1, 0, 0)), new Face(vertecies[1], vertecies[2], vertecies[3], new Vector3(-1, 0, 0)), // left
            new Face(vertecies[4], vertecies[5], vertecies[6], new Vector3(1, 0, 0)), new Face(vertecies[5], vertecies[6], vertecies[7], new Vector3(1, 0, 0)), // right
            new Face(vertecies[0], vertecies[2], vertecies[4], new Vector3(0, 0, -1)), new Face(vertecies[2], vertecies[4], vertecies[6], new Vector3(0, 0, -1)), // front
            new Face(vertecies[1], vertecies[3], vertecies[5], new Vector3(0, 0, 1)), new Face(vertecies[3], vertecies[5], vertecies[7], new Vector3(0, 0, 1)), // back
        ]);
    }
}