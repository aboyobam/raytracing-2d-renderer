import config from "../config";

const viewBuffer = new SharedArrayBuffer(config.renderer.width * config.renderer.height * 4);
const pixels = new Uint8ClampedArray(viewBuffer);

const canvas = document.createElement("canvas");
canvas.width = config.width;
canvas.height = config.height;
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, config.renderer.width, config.renderer.height);

document.body.appendChild(canvas);

const workers: Worker[] = [];

let finished = 0;
const start = performance.now();

for (let mod = 0; mod < config.threads; mod++) {
    const worker = new Worker("/js/" + config.file + ".bundle.js");
    worker.postMessage({
        type: "config",
        data: {
            mod, total: config.threads,
            config: config.renderer,
            buffer: viewBuffer
        }
    });

    workers.push(worker);

    worker.onmessage = (event) => {
        if (event.data == "done") {
            finished++;
            if (finished == config.threads) {
                console.log("Rendering time:", performance.now() - start);
            }
        }
    }
}

function draw() {
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);