import { RendererConstructor } from "./Renderer";
import Raytracer from "@/Raytracer";
import Light from "@/Light";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";
import { StubReflectRendererSetup } from "@/config";

class StubReflectRenderer extends BaseRenderer {
    declare protected readonly localConfig: StubReflectRendererSetup;

    protected calulatePixel(origin: Vector3, dir: Vector3, depth = 0): ColorLike {
        const [hit] = this.rc.intersectOrder(origin, dir);

        if (!hit) {
            return;
        }

        const q = hit.angle / 180;
        const [br, bg, bb] = hit.face.material.getColorAt(hit.face, hit.point);
        const baseColor: ColorLike = [br * q, bg * q, bb * q];

        if (depth < this.localConfig.maxDepth) {
            if (hit.face.material.specular) {
                const newStrengh = hit.face.material.specular;
                const oldStrength = 1 - newStrengh;
                
                const target = this.calulatePixel(hit.point, hit.outDir, depth + 1);

                let nr: number, ng: number, nb: number;
                if (target) {
                    [nr, ng, nb] = target;
                } else {
                    // return baseColor;
                    nr = ng = nb = 255;
                }

                return [
                    baseColor[0] * oldStrength + nr * newStrengh,
                    baseColor[1] * oldStrength + ng * newStrengh,  
                    baseColor[2] * oldStrength + nb * newStrengh
                ];
            }
        }

        return baseColor;
    }
}

export default StubReflectRenderer satisfies RendererConstructor;