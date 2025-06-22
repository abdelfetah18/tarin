import { IncomingMessage, ServerResponse } from "http";

export type Response = ServerResponse<IncomingMessage> & { req: IncomingMessage; };

export default class ResponseHandler {
    constructor(public response: Response) { }

    status(statusCode: number): ResponseHandler {
        this.response.statusCode = statusCode;

        return this;
    }

    json(data: any): ResponseHandler {
        this.response.setHeader("content-type", "application/json");
        this.response.write(JSON.stringify(data));
        this.response.end();

        return this;
    }

    buffer(data: Buffer, contentType: string): ResponseHandler {
        this.response.setHeader("content-type", contentType);
        this.response.write(data);
        this.response.end();

        return this;
    }

    setHeaders(headers: Record<string, string | string[]>): ResponseHandler {
        const headerNames = Object.getOwnPropertyNames(headers);

        for (let headerName of headerNames) {
            this.response.setHeader(headerName, headers[headerName]);
        }

        return this;
    }
}