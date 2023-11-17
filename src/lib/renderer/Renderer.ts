import Scene from "@/Scene";
import AppConfig from "@/config";
import PhotonTree from "@/optimizer/PhotonMapper/PhotonTree";

export interface Renderer {
    render(scene: Scene): void;
}

export interface RendererConstructor {
    new(buffer: SharedArrayBuffer, offset: number, skip: number, localConfig: AppConfig['renderer']['renderer']): Renderer;
    readonly usesPhotonMapper?: boolean;
    photonTree?: PhotonTree;
}