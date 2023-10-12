import Mesh from "./Mesh";
import Object3D from "./Object3D";

export default class Scene extends Object3D {
    public readonly meshes: Mesh[] = [];

    add(...objs: Mesh[]) {
        for (const obj of objs) {
            this.meshes.push(obj);
            obj.parent = this;
        }
    }

    *[Symbol.iterator]() {
        for (const mesh of this.meshes) {
            yield* mesh;
        }
    }
}