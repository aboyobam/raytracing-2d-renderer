import { RendererConstructor } from "./Renderer";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";
import { LightReflectRendererSetup } from "@/config";
import Face from "@/Face";
import { Intersection } from "@/Raytracer";
import MonteCarloEstimator from "./MonteCarloEstimator";

class LightReflectRenderer extends BaseRenderer {
    declare protected readonly localConfig: LightReflectRendererSetup;

    private reflectiveFaces: Face[];
    private monteCarlo: MonteCarloEstimator;

    protected beforeRender(): void {
        this.reflectiveFaces = [];

        for (const mesh of this.scene) {
            for (const face of mesh.geometry.faces) {
                if (face.material.specular) {
                    this.reflectiveFaces.push(face);
                }
            }
        }

        this.monteCarlo = new MonteCarloEstimator(this.localConfig.monteCarsoSamples);
    }

    protected calulatePixel(origin: Vector3, dir: Vector3, lightStrength = 0, depth = 0): [number, number, number, number] {
        const [hit] = this.rc.intersectOrder(origin, dir);

        if (!hit) {
            return;
        }

        lightStrength += this.calculateLight(hit);

        const q = (hit.angle / 180) * lightStrength;
        const [br, bg, bb] = hit.face.material.getColorAt(hit.face, hit.point);
        const baseColor = [br * q, bg * q, bb * q, 255] as [number, number, number, number];

        if (depth < this.localConfig.maxReflectionDepth) {
            if (hit.face.material.specular) {
                const newStrengh = hit.face.material.specular;
                const oldStrength = 1 - newStrengh;
                
                const target = this.calulatePixel(hit.point, hit.outDir, lightStrength, depth + 1);

                let nr: number, ng: number, nb: number;
                if (target) {
                    [nr, ng, nb] = target;
                } else {
                    nr = ng = nb = 255;
                }

                return [
                    baseColor[0] * oldStrength + nr * newStrengh,
                    baseColor[1] * oldStrength + ng * newStrengh,  
                    baseColor[2] * oldStrength + nb * newStrengh,
                    255
                ];
            }
        }

        return baseColor;
    }

    private calculateLight(hit: Intersection) {
        let lightStrength = 0;

        // direct lumination
        for (const light of this.scene.lights) {
            const lightDir = hit.point.sub(light.worldPosition).norm();
            const [lightHit, ...rest] = this.rc.intersectOrder(light.worldPosition, lightDir);

            if (!lightHit) {
                continue;
            }

            if (lightHit.face !== hit.face) {
                let foundElse = false;
                
                for (const other of rest) {
                    if ((other.distance - lightHit.distance) > this.localConfig.lightInpercisionEpsilon) {
                        break;
                    }
                    
                    if (other.face === hit.face) {
                        foundElse = true;
                        break;
                    }
                }

                if (!foundElse) {
                    continue;
                }
            }
            
            lightStrength += light.intensity / Math.pow(1 + (lightHit.distance / light.distance), light.decay);
        }

        // indirect lumination
        for (const dir of this.monteCarlo) {
            lightStrength += this.trackLight(hit.point, dir) * (hit.face.normal.angleTo(dir.multScalar(-1)) / Math.PI);
        }

        return lightStrength;
    }

    private trackLight(from: Vector3, dir: Vector3, strength = 1, distance = 0, depth = 0) {
        const [hit] = this.rc.intersectOrder(from, dir);
        if (!hit || !hit.face.material.illusive) {
            return 0;
        }

        strength *= hit.face.material.illusive;
        let localStrenth = 0;

        for (const light of this.scene.lights) {
            const dirToPoint = hit.point.sub(light.worldPosition).norm();
            const [lightHit] = this.rc.intersectOrder(light.worldPosition, dirToPoint);

            if (!lightHit || lightHit.face !== hit.face) {
                continue;
            }

            const angle = lightHit.outDir.angleTo(dir);
            const impactStrength = strength * (angle / Math.PI);
            localStrenth += impactStrength * light.intensity / Math.pow(1 + ((distance + lightHit.distance) / light.distance), light.decay);
        }

        if (depth < this.localConfig.maxLightBounce) {
            localStrenth += this.trackLight(
                hit.point,
                hit.outDir,
                strength,
                distance + hit.distance,
                depth + 1
            );
        }

        return localStrenth;
    }
}

export type TLightReflectRenderer = LightReflectRenderer;

export default LightReflectRenderer satisfies RendererConstructor;