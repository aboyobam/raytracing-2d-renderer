import AppConfig from "@/config";
import LightRenderer from "./LightRenderer";
import AlphaRenderer from "./AlphaRenderer";
import LightAlphaRenderer from "./LightAlphaRenderer";
import WireframeRenderer from "./WireframeRenderer";
import StubRenderer from "./StubRenderer";
import StubReflectRenderer from "./StubReflectRenderer";
import LightReflectRenderer from "./LightReflectRenderer";
import AllRenderer from "./AllRenderer";
import { RendererConstructor } from "./Renderer";

const rendererMap: Record<AppConfig['renderer']['renderer']['type'], RendererConstructor> = {
    light: LightRenderer,
    alpha: AlphaRenderer,
    lightAlpha: LightAlphaRenderer,
    wireframe: WireframeRenderer,
    stub: StubRenderer,
    stubReflect: StubReflectRenderer,
    lightReflect: LightReflectRenderer,
    all: AllRenderer
};

export default rendererMap;