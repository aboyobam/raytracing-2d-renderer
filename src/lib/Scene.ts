import Light from "./Light";
import Material from "./Material";
import Mesh from "./Mesh";
import Object3D from "./Object3D";
import Vector3 from "./Vector3";
import CubeGeometry from "./geometries/CubeGeometry";

export default class Scene extends Object3D {
    public readonly meshes: Mesh[] = [];
    public readonly boundingBox: [Vector3, Vector3] = [new Vector3, new Vector3];
    public readonly lights: Light[] = [];

    add(...objs: Mesh[]) {
        for (const obj of objs) {
            this.meshes.push(obj);
            obj.parent = this;
        }
    }

    addLight(light: Light) {
        light.parent = this;
        this.lights.push(light);

        //#region [DUMMY]
        const cube = new CubeGeometry(0.05, 0.05, 0.05);
        const cubeMesh = new Mesh(cube, new Material(0, 0, 0, 256));
        cubeMesh.position.copy(light.position);
        // this.add(cubeMesh);
        //#endregion
    }

    build() {
        const [bbMin, bbMax] = this.boundingBox;

        for (const mesh of this.meshes) {
            for (const face of mesh.geometry.faces) {
                face.translate(mesh.worldPosition);
                
                const [min, max] = face.getBoundingBox();
                bbMin.copy(Vector3.min(bbMin, min));
                bbMax.copy(Vector3.max(bbMax, max));

                face.material ??= mesh.material ?? Material.NONE;
            }
        }
    }

    *[Symbol.iterator]() {
        for (const mesh of this.meshes) {
            yield* mesh;
        }
    }
}