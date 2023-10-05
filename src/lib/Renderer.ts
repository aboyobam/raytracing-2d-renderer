import Camera from "./Camera";
import Material from "./Material";
import Raytracer from "./Raytracer";
import Scene from "./Scene";
import type AppConfig from "./config";

export default class Renderer {
    private readonly renderer: OffscreenCanvas;
    private readonly imageData: ImageData;
    private needsUpdate = false;
    private readonly pixels: Uint8ClampedArray;

    constructor(
        public readonly config: AppConfig['renderer'],
        public readonly buffer: SharedArrayBuffer,
        public readonly mod: number,
        public readonly total: number
    ) {
        this.renderer = new OffscreenCanvas(config.width, config.height);
        this.imageData = this.renderer.getContext("2d").getImageData(0, 0, config.width, config.height);
        const sharedUint8Array = new Uint8ClampedArray(buffer);
        sharedUint8Array.set(this.imageData.data);
        this.pixels = sharedUint8Array;
    }

    // private get pixels() {
    //     return this.imageData.data;
    // }

    setPixel(x: number, y: number, r: number, g: number, b: number, a = 256) {
        const index = (y * this.config.width + x) * 4;
        const pixels = this.pixels;

        pixels[index + 0] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = a;
        this.needsUpdate = true;
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

        const xStep = topRight.sub(topLeft).multScalar(1 / this.config.width);
        const yStep = bottomLeft.sub(topLeft).multScalar(1 / this.config.height);
        
        const rc = new Raytracer(scene, camera.position);

        for (let y = this.mod; y < this.config.height; y += this.total) {
            for (let x = 0; x < this.config.width; x++) {
                const dir = topLeft
                    .add(xStep.multScalar(x))
                    .add(yStep.multScalar(y))
                    .sub(camera.position)
                    .norm();

                const hits = Array.from(rc.castRay(dir));
                
                if (!hits.length) {
                    continue;
                }

                if (this.config.wireframe) {
                    for (const hit of hits) {
                        if (hit.edgeDist < this.config.wireframe) {
                            const { r, g, b } = hit.face.material ?? hit.mesh.material;
                            this.setPixel(x, y, r, g, b);
                        }
                    }
                } else {
                    const sorted = hits.sort((a, b) => a.distance - b.distance);

                    let strength = 0;
                    const colors: [Material, number, number][] = [];

                    for (const hit of sorted) {
                        const localAlpha = (hit.face.material ?? hit.mesh.material).a / 256;
                        const localStrength = (1 - strength) * localAlpha;
                        strength += localStrength;
                        colors.push([(hit.face.material ?? hit.mesh.material), localStrength, hit.angle / 180]);

                        if (strength > 0.999) {
                            break;
                        }
                    }

                    const { r, g, b, a }: Material = colors.reduce((acc, [{ r, g, b, a }, s, q]) => {
                        acc.r += r * q * s; 
                        acc.g += g * q * s; 
                        acc.b += b * q * s; 
                        acc.a += s * 256;
                        return acc;
                    }, new Material(0, 0, 0, 0));
                    
                    this.setPixel(x, y, r, g, b);
                }
            }
        }
    }
}