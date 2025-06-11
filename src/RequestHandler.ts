import FormData from "form-data";
import { Result, SchemaValidator, Tarin } from ".";
import { AnyCallback, AnyEndpoint, AnyInputType, Input } from "./Endpoint";
import express from "express";
import { readFileSync } from "fs";
import { TarinError, TarinObjectError } from "./SchemaValidator";

enum InputError {
    BodyError,
    QueryError,
    ParamsError,
    HeadersError,
    FilesError
}

interface ProcessError { error: TarinObjectError; type: InputError; }

const errorsMessages: { [k in InputError]: string; } = {
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

        const inputResult = this.processInput({
            query: req.query,
            body: req.body,
            params: req.params,
            headers: req.headers,
            files: req.files,
        });

        if (inputResult.isFailure()) {
            res.status(500).json({
                status: "error",
                message: errorsMessages[inputResult.error!.type],
                data: inputResult.error?.error,
            });
            return;
        }

        const { query, params, body, headers, files } = inputResult.value!;
        const result = await this.endpoint.callback({
            query: query,
            body: body,
            params: params,
            headers: headers,
            files: files,
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
                const file: SchemaValidator.File = output.files[fileName];
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

            const inputResult = this.processInput({
                query: req.query,
                body: req.body,
                params: req.params,
                headers: req.headers,
                files: req.files,
            });

            if (inputResult.isFailure()) {
                res.status(500).json({
                    status: "error",
                    message: errorsMessages[inputResult.error!.type],
                    data: inputResult.error?.error,
                });
                return;
            }

            const { query, params, body, headers, files } = inputResult.value!;
            const result = await callback({
                query: query,
                body: body,
                params: params,
                headers: headers,
                files: files,
                middleware: req.middleware
            });

            if (result.isFailure()) {
                res.status(400).json(result.error);
                return;
            }

            req.middleware = { ...req.middleware, ...result.value };

            next();
        }
    }

    processInput({ body, query, params, headers, files }: any): Result<ProcessError, AnyInputType> {
        const bodyResult = this.processBody(body);
        if (bodyResult.isFailure()) {

            return Result.failure({
                type: InputError.BodyError,
                error: bodyResult.error!,
            });
        }

        const queryResult = this.processQuery(query);
        if (queryResult.isFailure()) {
            return Result.failure({
                error: queryResult.error!,
                type: InputError.QueryError,
            });
        }

        const paramsResult = this.processParams(params);
        if (paramsResult.isFailure()) {
            return Result.failure({
                error: paramsResult.error!,
                type: InputError.ParamsError,
            });
        }

        const headersResult = this.processHeaders(headers);
        if (headersResult.isFailure()) {
            return Result.failure({
                error: headersResult.error!,
                type: InputError.HeadersError,
            });
        }

        const filesResult = this.processFiles(files);
        if (filesResult.isFailure()) {
            return Result.failure({
                error: filesResult.error!,
                type: InputError.FilesError,
            });
        }

        return Result.success({
            body: bodyResult.value,
            query: queryResult.value,
            params: paramsResult.value,
            headers: headersResult.value,
            files: filesResult.value,
        });
    }

    processBody(body: any): Result<SchemaValidator.TarinObjectError, any> {
        let bodyData = {};
        if (this.endpoint.inputType?.files == undefined) {
            bodyData = body;
        } else {
            try {
                bodyData = JSON.parse(body.data);
            } catch (error) {
                bodyData = {}
            }
        }

        const bodyErrors = this.endpoint.inputType?.body?.validate(bodyData);
        if (bodyErrors) {
            return Result.failure(bodyErrors);
        }

        return Result.success(bodyData);
    }

    processQuery(query: any): Result<SchemaValidator.TarinObjectError, any> {
        if (this.endpoint.inputType?.query) {
            const errorsOrData = this.endpoint.inputType.query.parse(query);
            return errorsOrData;
        }

        return Result.success({});
    }

    processParams(params: any): Result<SchemaValidator.TarinObjectError, any> {
        if (this.endpoint.inputType?.params) {
            const errorsOrData = this.endpoint.inputType.params.parse(params);
            return errorsOrData;
        }

        return Result.success({});
    }

    processHeaders(headers: any): Result<SchemaValidator.TarinObjectError, any> {
        if (this.endpoint.inputType?.headers) {
            const errorsOrData = this.endpoint.inputType.headers.parse(headers);
            return errorsOrData;
        }

        return Result.success({});
    }

    processFiles(files: { [fieldname: string]: Express.Multer.File[]; } | Express.Multer.File[] | undefined): Result<SchemaValidator.TarinObjectError, any> {
        let filesData = {};
        if (this.endpoint.inputType?.files) {
            if (Array.isArray(files)) {
                filesData = files.reduce((acc: { [K in string]: SchemaValidator.File; }, file: SchemaValidator.File) => {
                    file.buffer = readFileSync(file.path!);
                    acc[file.fieldname] = file;
                    return acc;
                }, {});

                const filesErrors = this.endpoint.inputType.files.validate(filesData);
                if (filesErrors) {
                    return Result.failure(filesErrors);
                }
            }
        }

        return Result.success(filesData);
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