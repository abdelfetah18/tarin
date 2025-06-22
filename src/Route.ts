import * as pathToRegex from "path-to-regexp";
import { IncomingMessage, request } from "http";
import contentType from 'content-type';
import * as parseMultipartData from 'parse-multipart-data';
import { File } from "./SchemaValidator";
import { AnyEndpoint } from "./Endpoint";
import InputHandler, { inputHandlerErrorsMessages } from "./InputHandler";
import ResponseHandler, { Response } from "./ResponseHandler";
import FormData from "form-data";

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH" | "OPTIONS" | "TRACE"

export type RouteInput = {
    body: string | Buffer | Record<string, any> | undefined;
    query: Record<string, string | string[]>;
    params: Record<string, string | string[]>;
    headers: Record<string, string | string[]>;
    files: Record<string, File>;
}

export default class Route {
    constructor(public endpoint: AnyEndpoint) { }

    async handle(request: IncomingMessage, response: Response): Promise<void> {
        const responseHandler = new ResponseHandler(response);
        const routeInput = this.extractInput(request);
        const inputHandler = new InputHandler(
            routeInput.body,
            routeInput.query,
            routeInput.params,
            routeInput.headers,
            routeInput.files
        );

        if (this.endpoint.inputType) {
            // 1. Parsing
            const parsingResult = inputHandler.parse(this.endpoint.inputType);
            if (parsingResult.isFailure()) {
                responseHandler.status(200).json({
                    status: "error",
                    data: parsingResult.error!.error,
                    message: inputHandlerErrorsMessages[parsingResult.error!.type],
                });
                return;
            }

            // 2. Validation
            const validationResult = inputHandler.validate(this.endpoint.inputType);
            if (validationResult.isFailure()) {
                responseHandler.status(200).json({
                    status: "error",
                    data: validationResult.error!.error,
                    message: inputHandlerErrorsMessages[validationResult.error!.type],
                });
                return;
            }
        }

        // 3. Middleware
        let middlewareOutput = undefined;
        if (this.endpoint.middlewares.length > 0) {
            for (let middlewareCallback of this.endpoint.middlewares) {
                let middlewareCallbackResult = await middlewareCallback({ ...routeInput, middleware: middlewareOutput });
                if (middlewareCallbackResult.isFailure()) {
                    responseHandler.status(400).json(middlewareCallbackResult.error);
                    return;
                }
                middlewareOutput = middlewareCallbackResult.value;
            }
        }

        // 4. Callback
        if (this.endpoint.callback) {
            const callbackResult = await this.endpoint.callback({ ...routeInput, middleware: middlewareOutput });
            if (callbackResult.isFailure()) {
                responseHandler.status(400).json(callbackResult.error);
                return;
            }

            const output = callbackResult.value!;
            if (output.files) {
                const formData = new FormData();

                const fileNames = Object.getOwnPropertyNames(output.files);
                for (let fileName of fileNames) {
                    const file: File = output.files[fileName];
                    formData.append(fileName, file.buffer, { filename: fileName, contentType: "application/octet-stream" });
                }

                if (output.body) {
                    formData.append("data", JSON.stringify(output.body), { contentType: "application/json" });
                }

                responseHandler.status(200)
                    .setHeaders(output.headers || {})
                    .buffer(
                        formData.getBuffer(),
                        `multipart/form-data; boundary=${formData.getBoundary()}`
                    );

                return;
            } else {
                responseHandler.status(200)
                    .setHeaders(output.headers || {})
                    .json(output.body || {});

                return;
            }
        } else {
            responseHandler.status(500).json({
                status: "error",
                message: "No logic sepecfied by the server",
            });
            return;
        }
    }

    match(method: string, path: string): boolean {
        return pathToRegex.match(this.endpoint.path)(path) && method.toLocaleLowerCase() == this.endpoint.method.toLocaleLowerCase();
    }

    extractInput(request: IncomingMessage): RouteInput {
        const routeInput: RouteInput = {
            body: undefined,
            query: {},
            params: {},
            headers: {},
            files: {},
        };

        const url = new URL(`https://localhost${request.url}`);

        // Extract Params
        const pathMatch = pathToRegex.match(this.endpoint.path)(url.pathname);
        if (pathMatch) {
            routeInput.params = pathMatch.params as Record<string, string | string[]>;
        }

        // Extract Query

        for (const key of url.searchParams.keys()) {
            const values = url.searchParams.getAll(key);
            routeInput.query[key] = values[0];
        }

        // Extract Body & Files
        const data = request.body;

        const contentTypeHeader = request.headers["content-type"] || "text/plain";
        const { type, parameters } = contentType.parse(contentTypeHeader);
        if (type == "multipart/form-data") {
            routeInput.body = {};

            const boundary = parameters.boundary;
            const parts = parseMultipartData.parse(data, boundary);

            for (let part of parts) {
                if (part.filename) {
                    routeInput.files[part.filename] = {
                        filename: part.filename,
                        buffer: part.data,
                        mimetype: part.type,
                        size: part.data.length,
                    };
                }

                if (part.name) {
                    routeInput.body[part.name] = part.data;
                }
            }
        } else {
            try {
                routeInput.body = JSON.parse(data.toString());
            } catch (error) {
                routeInput.body = data.toString();
            }
        }

        // Extract Headers
        routeInput.headers = request.headers as Record<string, string | string[]>;

        return routeInput;
    }
}