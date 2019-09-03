import express from "express";
import { Errors } from "typescript-rest";

export default (err: any, _req: express.Request, res: express.Response, next: express.NextFunction): void => {
    // Express requires that if the headers have already been sent
    // that we simply defer to the next handler.
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof Errors.HttpError){
        res.set("Content-Type", "application/json");
        res.status(err.statusCode);
        res.json({
            error: err.message,
            code: err.statusCode
        });
    } else {
        res.status(500);
        res.json({
            error: "Internal server error",
            code: 500
        });
    }
};
