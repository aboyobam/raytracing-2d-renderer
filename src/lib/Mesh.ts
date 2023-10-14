import Geometry from "./Geometry";
import Material from "./Material";
import Object3D from "./Object3D";
import Vector3 from "./Vector3";

export default class Mesh extends Object3D {
    constructor(public readonly geometry: Geometry, public readonly material: Material) {
        super();
    };

    public readonly children: Mesh[] = [];

    add(mesh: Mesh) {
        mesh.parent = this;
        this.children.push(mesh);
    }

    attach(mesh: Mesh) {
        this.add(mesh);
        for (const child of mesh) {
            child.position.sub(this.position);
        }
    }

    rotate(axis: Vector3, angle: number): void {
        const radians = angle * (Math.PI / 180);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const { x: u, y: v, z: w } = axis.norm();
    
        const applyRotation = (vertex: Vector3) => {
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
        };

        
        this.geometry.vertecies.forEach(applyRotation);
        this.geometry.faces.forEach(face => applyRotation(face.normal));
    }

    *[Symbol.iterator](): IterableIterator<Mesh> {
        yield this;
        for (const child of this.children) {
            yield* child;
        }
    }
}