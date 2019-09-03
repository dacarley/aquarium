import express from "express";
import ErrorHandler from "./ErrorHandler";
import { Server } from "typescript-rest";

const port = 4000;

export default {
    init() {
        const app = express();
        app.use("/", (_req, res) => {
            res.send("Hello World");
            res.end();
        });

        const api = express.Router();

        Server.loadServices(api, `${__dirname}/../apis/**/*Api.ts`);

        app.use("/api", api);
        app.use(ErrorHandler);

        app.listen(port, function() {
            console.log(`Server listening at http://localhost:${port}!`);
        });
    }
};
