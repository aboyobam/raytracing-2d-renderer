import Camera from "./Camera";
import Material from "./Material";
import Raytracer, { Intersection } from "./Raytracer";
import Scene from "./Scene";
import type AppConfig from "./config";
import { rendererConfig } from "./setup";
import Decimal from "decimal.js"

export default class Renderer {
    private readonly pixels: Uint8ClampedArray;

    constructor(
        public readonly config: AppConfig['renderer'],
        public readonly buffer: SharedArrayBuffer,
        public readonly mod: number,
        public readonly total: number
    ) {
        this.pixels = new Uint8ClampedArray(buffer);
    }

    setPixel(x: number, y: number, r: number, g: number, b: number, a = 256) {
        const index = (y * this.config.width + x) * 4;
        const pixels = this.pixels;

        pixels[index + 0] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = a;
    }

    render(camera: Camera, scene: Scene) {
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
        
        const rc = new Raytracer(scene, camera);

        for (let y = this.mod; y < this.config.height; y += this.total) {
            for (let x = 0; x < this.config.width; x++) {
                const dir = topLeft
                    .add(xStep.multScalar(x))
                    .add(yStep.multScalar(y))
                    .norm();

                const hits = rc.intersectOrder(camera.position, dir);

                if (!hits.length) {
                    this.setPixel(x, y, 230, 230, 230);
                    continue;
                }

                const lightAlpha = Array(hits.length).fill(rendererConfig.alpha ? 0 : 1);

                if (this.config.wireframe) {
                    for (const hit of hits) {
                        if (hit.edgeDist.lte(this.config.wireframe)) {
                            const { r, g, b } = hit.face.material ?? hit.mesh.material;
                            this.setPixel(x, y, r, g, b);
                        }
                    }
                } else {
                    //#region light
                    if (rendererConfig.hasLight) {
                        if (rendererConfig.alpha) {
                            for (let index = 0; index < hits.length; index++) {
                                const hit = hits[index];
                                let lightStrength = 0;

                                for (const light of scene.lights) {
                                    const lightDir = hit.point.sub(light.worldPosition);
                                    const lightHits = rc.intersectOrder(light.worldPosition, lightDir);

                                    let strength = 0;
                                    for (const lightHit of lightHits) {
                                        const localAlpha = lightHit.face.material.a / 256;
                                        const localStrength = (1 - strength) * localAlpha;
                                        strength += localStrength;
                                        
                                        if (lightHit.face === hit.face) {
                                            const dist = light.worldPosition.sub(lightHit.point).len();
                                            lightStrength = localStrength * light.intensity / Math.pow(dist.div(light.distance).add(1).toNumber(), light.decay);;
                                            break;
                                        }
                
                                        if (strength > 0.999) {
                                            break;
                                        }
                                    }
                                }
    
                                lightAlpha[index] = lightStrength;
                            }
                        } else {
                            const [hit] = hits;
                            let lightStrength = 0;
                            for (const light of scene.lights) {
                                const lightDir = hit.point.sub(light.worldPosition).norm();
                                const [lightHit] = rc.intersectOrder(light.worldPosition, lightDir);

                                // if (lightHit.face !== hit.face) {
                                //     console.log("light no hit", [
                                //         lightDir.pretty(20),
                                //         dir.pretty(20),
                                //     ]);
                                //     continue;
                                // }

                                const dist = light.worldPosition.sub(hit.point).len();
                                lightStrength += light.intensity / Math.pow(dist.div(light.distance).add(1).toNumber(), light.decay);
                            }

                            lightAlpha[0] = lightStrength;
                        }

                        /*for (const light of scene.lights) {
                            const lightDir = hit.point.sub(light.worldPosition);
                            const lightHits = Array.from(rc.castRay(light.worldPosition, lightDir)).sort((a, b) => a.distance - b.distance);
                            console.log(hit.point.pretty(), lightDir.norm().pretty(), hit.face.name, lightHits[0].face.name);
                            
                            let localLightStrength = 0;
                            for (const lightHit of lightHits) {
                                const localAlpha = lightHit.face.material.a / 256;
                                const localStrength = (1 - localLightStrength) * localAlpha;
                                localLightStrength += localStrength;

                                const dist = light.worldPosition.sub(hit.point).len();
                                const strength = light.intensity / Math.pow(1 + (dist / light.distance), light.decay);

                                lightStrength += localStrength * strength;
        
                                if (localLightStrength > 0.999) {
                                    break;
                                }
                            }
                        }*/

                    }
                    //#endregion

                    //#region pixel color
                    const colors: [Intersection, number][] = [];
                    if (rendererConfig.alpha) {
                        let strength = 0;
                        for (const hit of hits) {
                            const localAlpha = hit.face.material.a / 256;
                            const localStrength = (1 - strength) * localAlpha;
                            strength += localStrength;
                            colors.push([hit, localStrength]);
    
                            if (strength > 0.999) {
                                break;
                            }
                        }
                    } else {
                        const [hit] = hits;
                        colors.push([hit, 1]);
                    }
                    //#endregion

                    const { r, g, b, a }: Material = colors.reduce((acc, [hit, s], i) => {
                        const [r, g, b] = hit.face.material.getColorAt(hit.face, hit.point);
                        const q = hit.angle.toNumber() / 180;
                        acc.r += r * q * s * lightAlpha[i]; 
                        acc.g += g * q * s * lightAlpha[i]; 
                        acc.b += b * q * s * lightAlpha[i]; 
                        acc.a += s * 256;
                        return acc;
                    }, new Material(0, 0, 0, 0));
                    this.setPixel(x, y, r, g, b, a);
                }
            }
        }
    }
}