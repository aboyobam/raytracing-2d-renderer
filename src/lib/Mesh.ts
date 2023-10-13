import Geometry from "./Geometry";
import Material from "./Material";
import Object3D from "./Object3D";
import Vector3 from "./Vector3";
import Decimal from "decimal.js";

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
        const cos = Decimal.cos(radians);
        const sin = Decimal.cos(radians);
        const { x: u, y: v, z: w } = axis.norm();
    
        const applyRotation = (vertex: Vector3) => {
            const oneMinusCos = new Decimal(1).sub(cos);

            const rotatedX = vertex.x.mul(cos.add(u.mul(u).mul(oneMinusCos)))
                            .add(vertex.y.mul(u.mul(v).mul(oneMinusCos).sub(w.mul(sin))))
                            .add(vertex.z.mul(u.mul(w).mul(oneMinusCos).add(v.mul(sin))));
            
            const rotatedY = vertex.x.mul(v.mul(u).mul(oneMinusCos).add(w.mul(sin)))
                            .add(vertex.y.mul(cos.add(v.mul(v).mul(oneMinusCos))))
                            .add(vertex.z.mul(v.mul(w).mul(oneMinusCos).sub(u.mul(sin))));
            
            const rotatedZ = vertex.x.mul(w.mul(u).mul(oneMinusCos).sub(v.mul(sin)))
                            .add(vertex.y.mul(w.mul(v).mul(oneMinusCos).add(u.mul(sin))))
                            .add(vertex.z.mul(cos.add(w.mul(w).mul(oneMinusCos))));
    
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