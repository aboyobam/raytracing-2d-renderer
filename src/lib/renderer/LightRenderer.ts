import type { LightRendererSetup } from "@/config";
import type { RendererConstructor } from "./Renderer";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";

class LightRenderer extends BaseRenderer {
    declare protected readonly localConfig: LightRendererSetup;

    protected calulatePixel(origin: Vector3, dir: Vector3): ColorLike {
        const [hit] = this.rc.intersectOrder(origin, dir);
                
        if (!hit) {
            return;
        }

        //#region light
        const lightStrength = new Vector3();
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
            
            const angleStrength = lightDir.angleTo(hit.face.normal) / Math.PI;
            const strength = angleStrength * light.intensity / Math.pow(1 + (lightHit.distance / light.distance), light.decay);
            lightStrength.x += strength * light.color[0];
            lightStrength.y += strength * light.color[1];
            lightStrength.z += strength * light.color[2];
        }

        const q = hit.angle / 180;

        const [br, bb, bg] = hit.face.material.getColorAt(hit.face, hit.point);

        return [
            br * q * lightStrength.x,
            bb * q * lightStrength.y,
            bg * q * lightStrength.z
        ];
    }
}

export default LightRenderer satisfies RendererConstructor;