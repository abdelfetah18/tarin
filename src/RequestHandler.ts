import FormData from "form-data";
import { Result, SchemaValidator } from ".";
import { AnyCallback, AnyEndpoint, AnyInput, Input } from "./Endpoint";
import express from "express";
import { readFileSync } from "fs";
import InputHandler, { InputHandlerError, InputHandlerErrorType } from "./InputHandler";

const errorsMessages: { [Key in InputHandlerErrorType]: string; } = {
    0: "Invalid body",
    1: "Invalid query",
    2: "Invalid params",
    3: "Invalid headers",
    4: "Invalid files",
}

export default class RequestHandler {
    private endpoint: AnyEndpoint;

    constructor(endpoint: AnyEndpoint) {
        this.endpoint = endpoint;
    }

    handle = async (req: express.Request, res: express.Response): Promise<void> => {
        if (!this.endpoint.callback) {
            res.status(500).json({
                status: "error",
                message: "No logic sepecfied by the server"
            });
            return;
        }

        if (!this.endpoint.inputType && !this.endpoint.outputType) {
            res.status(500).json({
                status: "error",
                message: "Both input type and output type were not specified"
            });
            return;
        }

        const inputHandlingResult = this.handleInput({
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers,
            files: req.files,
        });

        if (inputHandlingResult.isFailure()) {
            res.status(500).json({
                status: "error",
                message: errorsMessages[inputHandlingResult.error!.type],
                data: inputHandlingResult.error!.error,
            });
            return;
        }

        const input = inputHandlingResult.value;
        const result = await this.endpoint.callback({
            ...input,
            middleware: req.middleware,
        });

        if (result.isFailure()) {
            res.status(400).json(result.error);
            return;
        }

        const output = result.value!;

        if (this.endpoint.outputType && this.endpoint.outputType.files) {
            const formData = new FormData();

            const filesNames = Object.getOwnPropertyNames(output.files);
            for (let fileName of filesNames) {
                const file = output.files![fileName];
                formData.append(fileName, file.buffer, { filename: fileName, contentType: "application/octet-stream" });
            }

            if (output.body) {
                formData.append("data", JSON.stringify(output.body), { contentType: "application/json" });
            }

            res.status(200)
                .setHeaders(this.handleHeaders(
                    {
                        ...output.headers,
                        "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`
                    }
                ))
                .send(formData.getBuffer());

            return;
        }

        res.status(200).setHeaders(this.handleHeaders(output.headers)).json(output.body);
    }

    getMiddlewareHandler(callback: AnyCallback) {
        return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {

            const inputHandlingResult = this.handleInput({
                body: req.body,
                query: req.query,
                params: req.params,
                headers: req.headers,
                files: req.files,
            });

            if (inputHandlingResult.isFailure()) {
                res.status(500).json({
                    status: "error",
                    message: errorsMessages[inputHandlingResult.error!.type],
                    data: inputHandlingResult.error!.error,
                });
                return;
            }

            const input = inputHandlingResult.value;
            const result = await callback({
                ...input,
                middleware: req.middleware,
            });

            if (result.isFailure()) {
                res.status(400).json(result.error);
                return;
            }

            req.middleware = { ...req.middleware, ...result.value };

            next();
        }
    }

    processFiles(files: { [fieldname: string]: Express.Multer.File[]; } | Express.Multer.File[] | undefined) {
        if (Array.isArray(files)) {
            return files.reduce((acc: { [K in string]: SchemaValidator.File; }, file: SchemaValidator.File) => {
                file.buffer = readFileSync(file.path!);
                acc[file.fieldname] = file;
                return acc;
            }, {});
        }

        return {};
    }

    handleInput(input: Input<any, any, any, any, any>): Result<InputHandlerError, Input<any, any, any, any, any>> {
        const inputHandler = new InputHandler(input.body, input.query, input.params, input.headers, this.processFiles(input.files));
        const schemas = {
            body: this.endpoint.inputType?.body,
            query: this.endpoint.inputType?.query,
            params: this.endpoint.inputType?.params,
            headers: this.endpoint.inputType?.headers,
            files: this.endpoint.inputType?.files,
        };

        const parsingResult = inputHandler.parse(schemas);
        if (parsingResult.isFailure()) {
            return parsingResult;
        }

        const validationResult = inputHandler.validate(schemas);
        if (validationResult.isFailure()) {
            return validationResult;
        }

        return Result.success(input);
    }

    handleHeaders(headers: any = {}) {
        const result = new Map([
            ["Access-Control-Allow-Origin", "*"]
        ]);
        const headersNames = Object.getOwnPropertyNames(headers);
        for (let headerName of headersNames) {
            result.set(headerName, headers[headerName]);
        }
        return result;
    }
}