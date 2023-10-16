import Camera from "@/Camera";
import Scene from "@/Scene";
import AppConfig from "@/config";
import PhotonMapper from "@/optimizer/PhotonMapper/PhotonMapper";

export interface Renderer {
    render(camera: Camera, scene: Scene): void;
}

export interface RendererConstructor {
    new(buffer: SharedArrayBuffer, offset: number, skip: number, localConfig: AppConfig['renderer']['renderer']): Renderer;
    readonly usesPhotonMapper?: boolean;
    photonMapper?: PhotonMapper;
}