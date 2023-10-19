import Camera from "@/Camera";
import Scene from "@/Scene";
import { Renderer } from "./Renderer";
import Raytracer from "@/Raytracer";
import AppConfig from "@/config";
import Vector3 from "@/Vector3";
import PhotonMapper from "@/optimizer/PhotonMapper/PhotonMapper";
import rendererConfig from "@/rendererConfig";

export default abstract class BaseRenderer implements Renderer {
    static photonMapper: PhotonMapper;
    protected readonly pixels: Uint8ClampedArray;
    protected rc: Raytracer;
    protected scene: Scene;
    protected camera: Camera;

    // DUMMY
    private times: number[] = [];

    constructor(
        buffer: SharedArrayBuffer,
        protected readonly offset: number,
        protected readonly skip: number,
        protected readonly localConfig: AppConfig['renderer']['renderer']
    ) {
        this.pixels = new Uint8ClampedArray(buffer);
    }

    render(camera: Camera, scene: Scene): void {
        const planeHeight = 2 * Math.tan((camera.fov / 2) * (Math.PI / 180)) * camera.near;
        const planeWidth = planeHeight * camera.aspectRatio;

        const forward = camera.target.norm(); 
        const right = camera.up.cross(forward).norm();
        const up = forward.cross(right).norm(); 
        const center = camera.position.add(forward.multScalar(camera.near));
        const halfUp = up.multScalar(planeHeight / 2);
        const halfRight = right.multScalar(planeWidth / 2);

        const topLeft = center.add(halfUp).sub(halfRight);
        const topRight = center.add(halfUp).add(halfRight);
        const bottomLeft = center.sub(halfUp).sub(halfRight);

        const xStep = topRight.sub(topLeft).multScalar(1 / rendererConfig.width);
        const yStep = bottomLeft.sub(topLeft).multScalar(1 / rendererConfig.height);
        
        this.rc = new Raytracer(scene);
        this.scene = scene;
        this.camera = camera;

        this.beforeRender?.();

        for (let y = this.offset; y < rendererConfig.height; y += this.skip) {
            for (let x = 0; x < rendererConfig.width; x++) {
                const dir = topLeft
                    .add(xStep.multScalar(x))
                    .add(yStep.multScalar(y))
                    .norm();

                const start = performance.now();
                const color = this.calulatePixel(camera.position, dir);
                this.times.push(performance.now() - start);

                if (color) {
                    this.setPixel(x, y, ...color);
                } else {
                    this.setPixel(x, y, 240, 240, 240);
                }
            }
        }

        console.log("avg pixel time", 1000 / (this.times.reduce((a, b) => a + b) / this.times.length), "px per second");
    }

    protected abstract calulatePixel(origin: Vector3, dir: Vector3): [number, number, number, number];
    protected beforeRender?(): void;

    protected setPixel(x: number, y: number, r: number, g: number, b: number, a = 255) {
        const index = (y * rendererConfig.width + x) * 4;
        const pixels = this.pixels;

        pixels[index + 0] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = a;
    }
}