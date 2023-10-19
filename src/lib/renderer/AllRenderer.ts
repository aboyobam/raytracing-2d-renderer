import { RendererConstructor } from "./Renderer";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";
import { AllRendererSetup } from "@/config";
import { Intersection } from "@/Raytracer";

class AllRenderer extends BaseRenderer {
    declare protected readonly localConfig: AllRendererSetup;
    static readonly usesPhotonMapper = true;

    protected calulatePixel(origin: Vector3, dir: Vector3, depth = 0): [number, number, number, number] {
        const [hit] = this.rc.intersectOrder(origin, dir);

        if (!hit) {
            return;
        }

        const lightStrength = this.calculateLight(hit);
        const q = hit.angle / 180 * lightStrength;
        const [br, bg, bb] = hit.face.material.getColorAt(hit.face, hit.point);
        const baseColor = [br * q, bg * q, bb * q, 255] as [number, number, number, number];

        if (depth < this.localConfig.maxReflectionDepth) {
            const newStrengh = hit.face.material.specular;
            const oldStrength = 1 - newStrengh;
            const oldAlpha = hit.face.material.alpha;
            const newAlpha = 1 - oldAlpha;

            const specularTarget = newStrengh && this.calulatePixel(hit.point, hit.outDir, depth + 1);
            const alphaTarget = newAlpha && this.calulatePixel(hit.point, dir, depth + 1);

            const [nr, ng, nb] = specularTarget || Array(3).fill(240);
            const [ar, ag, ab] = alphaTarget || Array(3).fill(240);

            return [
                (baseColor[0] * oldStrength * oldAlpha) + (nr * newStrengh) + (ar * newAlpha),
                (baseColor[1] * oldStrength * oldAlpha) + (ng * newStrengh) + (ag * newAlpha),  
                (baseColor[2] * oldStrength * oldAlpha) + (nb * newStrengh) + (ab * newAlpha),
                255
            ];
        }

        return baseColor;
    }

    private calculateLight(hit: Intersection): number {
        let lightStrength = 0;

        // direct lumination
        light_loop: for (const light of this.scene.lights) {
            const lightDir = hit.point.sub(light.worldPosition).norm();
            const [lightHit, ...rest] = this.rc.intersectOrder(light.worldPosition, lightDir);

            if (!lightHit) {
                continue;
            }

            let alpha = 1;
            let distance = lightHit.distance;

            if (lightHit.face !== hit.face) {
                alpha = 1 - lightHit.face.material.alpha;

                if (alpha < 0.0001) {
                    continue light_loop;
                }
                
                let found = false;

                for (const other of rest) {
                    if (other.face === hit.face) {
                        distance = other.distance;
                        found = true;
                        break;
                    } else {
                        alpha *= (1 - other.face.material.alpha);

                        if (alpha < 0.0001) {
                            continue light_loop;
                        }
                    }
                }

                if (!found) {
                    continue light_loop;
                }
            }
            
            const angleStrength = lightDir.angleTo(hit.face.normal) / Math.PI;
            lightStrength += alpha * angleStrength * light.intensity / Math.pow(1 + (distance / light.distance), light.decay);
        }
        

        // indirect lumination
        if (this.localConfig.indirectIllumination) {
            const delta = this.localConfig.indirectIlluminationDelta;
            const photons = Array.from(AllRenderer.photonMapper.get(hit.point, delta));
            if (photons.length) {
                const indirects = photons.map((p) => {
                    const angleStrength = 1; // p.position.angleTo(hit.face.normal.neg()) / Math.PI;
                    const lengthStrength = delta / (delta + hit.point.sub(p.position).len());
                    return p.intensity * angleStrength * lengthStrength;
                });
                const indirect = indirects.reduce((acc, s) => acc + s, 0) / this.localConfig.indirectIlluminationDivider;
                lightStrength += indirect;
            }

        }

        return lightStrength;
    }
}

export type TLightReflectRenderer = AllRenderer;

export default AllRenderer satisfies RendererConstructor;