import config from "../config";

const viewBuffer = new SharedArrayBuffer(config.renderer.width * config.renderer.height * 4);
const pixels = new Uint8ClampedArray(viewBuffer);

const canvas = document.createElement("canvas");
canvas.width = config.width;
canvas.height = config.height;
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, config.renderer.width, config.renderer.height);

document.body.appendChild(canvas);

const worker = new Worker("/js/scenes/" + config.file + ".bundle.js");
worker.postMessage({
    type: "config",
    data: {
        threads: config.threads,
        config: config.renderer,
        buffer: viewBuffer
    }
});

let hintTxt: string[] = [];

worker.onmessage = ({ data }) => {
    hintTxt.push(`Renderer: ${data.renderer}`);
    hintTxt.push(`Faces: ${data.faces}`);
    hintTxt.push(`Lights: ${data.lights}`);
    hintTxt.push(`Time: ${data.time.toFixed(0)}ms`);
}

function draw() {
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    ctx.textAlign = "end";
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    ctx.fillText(hintTxt.join(", "), canvas.width - 10, 10);
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);