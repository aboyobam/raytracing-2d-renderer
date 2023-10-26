import { RendererConstructor } from "./Renderer";
import Raytracer from "@/Raytracer";
import Light from "@/Light";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";
import { StubRendererSetup } from "@/config";

class StubRenderer extends BaseRenderer {
    declare protected readonly localConfig: StubRendererSetup;

    protected calulatePixel(origin: Vector3, dir: Vector3): ColorLike {
        const [hit] = this.rc.intersectOrder(origin, dir, "none");
                
        if (!hit) {
            return;
        }

        const q = this.localConfig.useAngleStrength ? (hit.angle / 180) : 1;
        const [br, bb, bg] = hit.face.material.getColorAt(hit.face, hit.point);

        return [
            br * q * this.localConfig.colorMultiplier,
            bb * q * this.localConfig.colorMultiplier,
            bg * q * this.localConfig.colorMultiplier
        ];
    }
}

export default StubRenderer satisfies RendererConstructor;