import FormData from "form-data";
import { SchemaValidator } from ".";
import { AnyEndpoint } from "./Endpoint";
import express from "express";

export default class RequestHandler {
    private endpoint: AnyEndpoint;

    constructor(endpoint: AnyEndpoint) {
        this.endpoint = endpoint;
    }

    handle = (req: express.Request, res: express.Response): void => {
        const handleError = (error: any) => {
            throw error;
        }

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

        const bodyErrors = this.endpoint.inputType?.body?.validate(req.body);
        if (bodyErrors) {
            res.status(500).json({
                status: "error",
                message: "Invalid body",
                data: bodyErrors,
            });
            return;
        }

        let queryData: any = {};
        if (this.endpoint.inputType?.query) {
            const errorsOrData = this.endpoint.inputType.query.parse(req.query);
            if (errorsOrData.isFailure()) {
                res.status(500).json({
                    status: "error",
                    message: "Invalid query",
                    data: errorsOrData.error,
                });
                return;
            }
            queryData = errorsOrData.value;
        }

        // NOTE: The 'params' data is guaranteed to be present without errors such as missing values, 
        // as path matching relies on the existence of the parameter.
        let paramsData: any = {};
        if (this.endpoint.inputType?.params) {
            const errorsOrData = this.endpoint.inputType.params.parse(req.params);
            if (errorsOrData.isSuccess()) {
                paramsData = errorsOrData.value;
            }
        }

        let headersData: any = {};
        if (this.endpoint.inputType?.headers) {
            const errorsOrData = this.endpoint.inputType.headers.parse(req.headers);
            if (errorsOrData.isSuccess()) {
                headersData = errorsOrData.value;
            }
        }

        if (this.endpoint.inputType?.files) {
            const files = req.files;

            if (Array.isArray(files)) {
                const filesErrors = this.endpoint.inputType.files.validate(
                    files.reduce((acc: { [K in string]: SchemaValidator.File; }, file: SchemaValidator.File) => {
                        acc[file.fieldname] = file;
                        return acc;
                    }, {})
                );

                if (filesErrors) {
                    res.status(500).json({
                        status: "error",
                        message: "Invalid files",
                        data: filesErrors,
                    });
                    return;
                }
            }
        }

        try {
            const output = this.endpoint.callback({
                query: queryData,
                body: req.body,
                params: paramsData,
                headers: headersData,
            }, handleError);

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
            return;
        } catch (error) {
            res.status(400).json(error);
            return;
        }
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