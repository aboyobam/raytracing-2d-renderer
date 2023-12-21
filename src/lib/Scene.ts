import Camera from "./Camera";
import Light from "./Light";
import Material from "./Material";
import Mesh from "./Mesh";
import Object3D from "./Object3D";
import Vector3 from "./Vector3";
import createScanSamples from "./optimizer/PhotonMapper/createScanSamples";
import serializable from "./serializable";

@serializable("Scene")
export default class Scene extends Object3D {
    public readonly meshes: Mesh[] = [];
    public readonly boundingBox: [Vector3, Vector3] = [new Vector3, new Vector3];
    public readonly lights: Light[] = [];
    public readonly cameras: Camera[] = [];

    faces = 0;

    add(...objs: Mesh[]) {
        for (const obj of objs) {
            this.meshes.push(obj);
            obj.parent = this;

            this.faces += obj.geometry.faces.length;
        }
    }

    addLight(light: Light) {
        light.parent = this;
        this.lights.push(light);
    }

    build() {
        const [bbMin, bbMax] = this.boundingBox;

        for (const mesh of this) {
            for (const face of mesh.geometry.faces) {
                face.translate(mesh.worldPosition);
                
                const [min, max] = face.getBoundingBox();
                bbMin.copy(Vector3.min(bbMin, min));
                bbMax.copy(Vector3.max(bbMax, max));

                face.material ??= mesh.material ?? Material.NONE;
            }
        }

        // emmiting
        for (const mesh of this) {
            for (const face of mesh.geometry.faces) {
                const [intensity, distance, decay] = face.material.emmitting;
                if (!intensity) {
                    continue;
                }

                face.material.ambient = [intensity * face.material.r / 100, intensity * face.material.b / 100, intensity * face.material.b / 100];

                for (const point of createScanSamples(face, 0.4)) {
                    const color = face.material.getColorAt(face, point);
                    const light = new Light(intensity, distance, decay);
                    light.ignoreIndirect = true;
                    light.color = color;
                    light.fromFace = face;
                    this.addLight(light);
                }
            }
        }
    }

    *[Symbol.iterator]() {
        yield* this.meshes;
    }
}