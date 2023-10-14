import { WireframeRendererSetup } from "@/config";
import { RendererConstructor } from "./Renderer";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";

class WireframeRenderer extends BaseRenderer {
    declare protected readonly localConfig: WireframeRendererSetup;

    protected calulatePixel(origin: Vector3, dir: Vector3): [number, number, number, number] {
        const hits = this.rc.intersectOrder(origin, dir);
                
        if (!hits.length) {
            return;
        }

        for (const hit of hits) {
            if (hit.edgeDist < this.localConfig.wireframe) {
                const { r, g, b } = hit.face.material ?? hit.mesh.material;
                return [r, g, b, 255];
            }
        }
    }
}

export default WireframeRenderer satisfies RendererConstructor;