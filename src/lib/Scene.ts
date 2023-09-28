import Mesh from "./Mesh";

export default class Scene {
    public readonly meshes: Mesh[] = [];

    add(...objs: Mesh[]) {
        this.meshes.push(...objs);
    }

    *[Symbol.iterator]() {
        for (const mesh of this.meshes) {
            yield* mesh;
        }
    }
}