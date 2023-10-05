import config from "../config";

const renderer = new OffscreenCanvas(config.renderer.width, config.renderer.height);
const rendererCtx = renderer.getContext("2d");
const imageData = rendererCtx.getImageData(0, 0, config.renderer.width, config.renderer.height);

const viewBuffer = new SharedArrayBuffer(config.renderer.width * config.renderer.height * 4);

const canvas = document.createElement("canvas");
canvas.width = config.width;
canvas.height = config.height;
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

for (let mod = 0; mod < config.threads; mod++) {
    const worker = new Worker(config.file + ".bundle.js");
    worker.postMessage({
        mod, total: config.threads,
        config: config.renderer,
        buffer: viewBuffer
    });
}

function draw() {
    imageData.data.set(new Uint8Array(viewBuffer));
    rendererCtx.putImageData(imageData, 0, 0);
    ctx.imageSmoothingEnabled = config.smoothing;
    ctx.drawImage(renderer, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);