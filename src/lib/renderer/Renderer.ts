import Camera from "@/Camera";
import Scene from "@/Scene";
import AppConfig from "@/config";

export interface Renderer {
    render(camera: Camera, scene: Scene): void;
}

export interface RendererConstructor {
    new(buffer: SharedArrayBuffer, offset: number, skip: number, localConfig: AppConfig['renderer']['renderer']): Renderer;
}