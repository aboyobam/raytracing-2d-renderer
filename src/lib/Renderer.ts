import Camera from "./Camera";
import Raytracer from "./Raytracer";
import Scene from "./Scene";

export default class Renderer {
    public readonly canvas: HTMLCanvasElement;
    private readonly renderer: OffscreenCanvas;
    private readonly rendererCtx: OffscreenCanvasRenderingContext2D;
    private readonly canvasCtx: CanvasRenderingContext2D;
    private readonly imageData: ImageData;
    private needsUpdate = false;

    constructor(public readonly width: number, public readonly height: number, scale: number) {
        this.renderer = new OffscreenCanvas(width, height);
        this.rendererCtx = this.renderer.getContext("2d");
        this.canvas = document.createElement("canvas");
        this.canvasCtx = this.canvas.getContext("2d");
        this.canvas.width = width * scale;
        this.canvas.height = height * scale;

        this.imageData = this.rendererCtx.getImageData(0, 0, width, height);
    }

    private get pixels() {
        return this.imageData.data;
    }

    setPixel(x: number, y: number, r: number, g: number, b: number) {
        const index = (y * this.width + x) * 4;
        const pixels = this.pixels;

        pixels[index + 0] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = 256;
        this.needsUpdate = true;
    }

    animate() {
        const loop = () => {
            this.draw();
            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
    }

    draw() {
        if (this.needsUpdate) {
            this.rendererCtx.putImageData(this.imageData, 0, 0);
            this.needsUpdate = false;
        }
        
        this.canvasCtx.imageSmoothingEnabled = false;
        this.canvasCtx.drawImage(this.renderer, 0, 0, this.canvas.width, this.canvas.height);
    }

    render(camera: Camera, scene: Scene) {
        this.pixels.fill(256);

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

        const xStep = topRight.sub(topLeft).multScalar(1 / this.width);
        const yStep = bottomLeft.sub(topLeft).multScalar(1 / this.height);
        
        const rc = new Raytracer(scene, camera.position);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const dir = topLeft
                            .add(xStep.multScalar(x))
                            .add(yStep.multScalar(y))
                            .sub(camera.position)
                            .norm();

                const [first, ...hits] = rc.castRay(dir);
                if (!first) {
                    continue;
                }

                let closest = first;
                for (const hit of hits) {
                    if (hit.distance < closest.distance) {
                        closest = hit;
                    }
                }

                this.setPixel(x, y, 0, 0, (255 * (closest.angle / 180)));
            }
        }
    }
}