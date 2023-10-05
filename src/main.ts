import config from "./config";

const canvas = document.createElement("canvas");
canvas.width = config.width;
canvas.height = config.height;
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

const worker = new Worker(config.file + ".bundle.js");

worker.postMessage(config.renderer);

worker.onmessage = (event) => {
    if (event.data.type == "image") {
        return draw(event.data);
    }
};

const renderer = new OffscreenCanvas(config.renderer.width, config.renderer.height);
const rendererCtx = renderer.getContext("2d");
function draw({ image }: { image: ImageData }) {
    rendererCtx.putImageData(image, 0, 0);
    ctx.imageSmoothingEnabled = config.smoothing;
    ctx.drawImage(renderer, 0, 0, canvas.width, canvas.height);
}