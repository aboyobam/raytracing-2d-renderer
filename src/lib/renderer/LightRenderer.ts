import { LightRendererSetup } from "@/config";
import { RendererConstructor } from "./Renderer";
import Raytracer from "@/Raytracer";
import Light from "@/Light";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";

class LightRenderer extends BaseRenderer {
    declare protected readonly localConfig: LightRendererSetup;

    protected calulatePixel(origin: Vector3, dir: Vector3): [number, number, number, number] {
        const [hit] = this.rc.intersectOrder(origin, dir);
                
        if (!hit) {
            return;
        }

        //#region light
        let lightStrength = 0;
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

        const q = hit.angle / 180;
        const [br, bb, bg] = hit.face.material.getColorAt(hit.face, hit.point);

        return [
            br * q * lightStrength,
            bb * q * lightStrength,
            bg * q * lightStrength,
            255
        ];
    }
}

export default LightRenderer satisfies RendererConstructor;