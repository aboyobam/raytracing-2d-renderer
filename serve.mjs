import express from "express";
import path from "node:path";

const app = express();

app.use((_req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
}, express.static(path.resolve("dist")));

app.listen(9000);
