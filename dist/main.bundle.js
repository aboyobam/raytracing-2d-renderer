/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const config = {
    file: 'blender-scene',
    width: 500,
    height: 500,
    smoothing: true,
    threads: 10,
    renderer: {
        threadSync: true,
        wireframe: 0,
        width: 500,
        height: 500,
        cameraFov: 45,
        cameraNear: 2,
        qtEnabled: true,
        qtMaxSize: 512,
    }
};
exports["default"] = config;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*************************!*\
  !*** ./src/lib/main.ts ***!
  \*************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ../config */ "./src/config.ts");
const viewBuffer = new SharedArrayBuffer(config_1.default.renderer.width * config_1.default.renderer.height * 4);
const pixels = new Uint8ClampedArray(viewBuffer);
const canvas = document.createElement("canvas");
canvas.width = config_1.default.width;
canvas.height = config_1.default.height;
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, config_1.default.renderer.width, config_1.default.renderer.height);
document.body.appendChild(canvas);
const workers = [];
for (let mod = 0; mod < config_1.default.threads; mod++) {
    const worker = new Worker(config_1.default.file + ".bundle.js");
    worker.postMessage({
        type: "config",
        data: {
            mod, total: config_1.default.threads,
            config: config_1.default.renderer,
            buffer: viewBuffer
        }
    });
    workers.push(worker);
}
if (config_1.default.renderer.threadSync) {
    Promise.all(workers.map(worker => new Promise(resolve => worker.onmessage = resolve))).then(() => {
        workers.forEach(worker => {
            worker.postMessage({
                type: "render"
            });
        });
    });
}
function draw() {
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

})();

/******/ })()
;
//# sourceMappingURL=main.bundle.js.map