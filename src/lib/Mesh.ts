import Geometry from "./Geometry";
import Material from "./Material";
import Object3D from "./Object3D";
import Vector3 from "./Vector3";
import serializable from "./serializable";

@serializable("Mesh")
export default class Mesh extends Object3D {
    constructor(public readonly geometry: Geometry, public readonly material?: Material) {
        super();
    };

    public readonly children: Mesh[] = [];

    static applyRotation(axis: Vector3, angle: number, vertex: Vector3) {
        const radians = angle * (Math.PI / 180);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const { x: u, y: v, z: w } = axis.clone().norm();
        
        const rotatedX = vertex.x * (cos + u * u * (1 - cos))
                        + vertex.y * (u * v * (1 - cos) - w * sin)
                        + vertex.z * (u * w * (1 - cos) + v * sin);
        
        const rotatedY = vertex.x * (v * u * (1 - cos) + w * sin)
                        + vertex.y * (cos + v * v * (1 - cos))
                        + vertex.z * (v * w * (1 - cos) - u * sin);

        const rotatedZ = vertex.x * (w * u * (1 - cos) - v * sin)
                        + vertex.y * (w * v * (1 - cos) + u * sin)
                        + vertex.z * (cos + w * w * (1 - cos));

        vertex.x = rotatedX;
        vertex.y = rotatedY;
        vertex.z = rotatedZ;   
    }

    add(mesh: Mesh) {
        mesh.parent = this;
        this.children.push(mesh);
    }

    rotate(axis: Vector3, angle: number): void {
        this.geometry.faces.forEach(face => {
            Mesh.applyRotation(axis, angle, face.u);
            Mesh.applyRotation(axis, angle, face.v);
            Mesh.applyRotation(axis, angle, face.w);
            Mesh.applyRotation(axis, angle, face.normal);

            if (face.uN && face.vN && face.wN) {
                Mesh.applyRotation(axis, angle, face.uN);
                Mesh.applyRotation(axis, angle, face.vN);
                Mesh.applyRotation(axis, angle, face.wN);
            }
        });
    }

    *[Symbol.iterator](): IterableIterator<Mesh> {
        yield this;
        for (const child of this.children) {
            yield* child;
        }
    }
}