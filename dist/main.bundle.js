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
    file: 'example1',
    width: 500,
    height: 500,
    smoothing: false,
    renderer: {
        width: 1000,
        height: 1000,
        cameraFov: 45,
        cameraNear: 2
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
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ./config */ "./src/config.ts");
const canvas = document.createElement("canvas");
canvas.width = config_1.default.width;
canvas.height = config_1.default.height;
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
const worker = new Worker(config_1.default.file + ".bundle.js");
worker.postMessage(config_1.default.renderer);
worker.onmessage = (event) => {
    if (event.data.type == "image") {
        return draw(event.data);
    }
};
const renderer = new OffscreenCanvas(config_1.default.renderer.width, config_1.default.renderer.height);
const rendererCtx = renderer.getContext("2d");
function draw({ image }) {
    rendererCtx.putImageData(image, 0, 0);
    ctx.imageSmoothingEnabled = config_1.default.smoothing;
    ctx.drawImage(renderer, 0, 0, canvas.width, canvas.height);
}

})();

/******/ })()
;
//# sourceMappingURL=main.bundle.js.map