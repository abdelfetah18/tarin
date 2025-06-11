import express from "express";
import { AnyCallback, AnyEndpoint } from "./Endpoint";
import RequestHandler from "./RequestHandler";
import { Server } from "http";
import OpenAPIInterpreter from "./OpenAPI/OpenAPIInterpreter";
import swaggerUIExpress from "swagger-ui-express";
import multer from "multer";

const uploadManager = multer({ dest: './uploads/' })

export default class Tarin {
    endpoints: AnyEndpoint[] = [];
    private expressApp?: express.Express;

    createServer(): express.Express {
        express();
        this.expressApp = express();
        this.expressApp.use(express.json());
        this.expressApp.use(uploadManager.any());
        return this.expressApp;
    }

    addEndpoint(endpoint: AnyEndpoint): void {
        this.endpoints.push(endpoint);
        this.handleEndpoint(endpoint);
    }

    private handleEndpoint(endpoint: AnyEndpoint): void {
        if (!this.expressApp) {
            throw new Error("Please call createServer method first.");
        }

        const requestHandler = new RequestHandler(endpoint);

        endpoint.middlewares.forEach(middlewareCallback => {
            this.expressApp!.use(endpoint.path, requestHandler.getMiddlewareHandler(middlewareCallback));
        });

        if (endpoint.method == "GET") {
            this.expressApp.get(endpoint.path, requestHandler.handle);
            return;
        }

        if (endpoint.method == "POST") {
            this.expressApp.post(endpoint.path, requestHandler.handle);
            return;
        }

        if (endpoint.method == "DELETE") {
            this.expressApp.delete(endpoint.path, requestHandler.handle);
            return;
        }

        if (endpoint.method == "PATCH") {
            this.expressApp.patch(endpoint.path, requestHandler.handle);
            return;
        }

        if (endpoint.method == "HEAD") {
            this.expressApp.head(endpoint.path, requestHandler.handle);
            return;
        }

        if (endpoint.method == "OPTIONS") {
            this.expressApp.options(endpoint.path, requestHandler.handle);
            return;
        }

        if (endpoint.method == "PUT") {
            this.expressApp.put(endpoint.path, requestHandler.handle);
            return;
        }

        if (endpoint.method == "TRACE") {
            this.expressApp.trace(endpoint.path, requestHandler.handle);
            return;
        }
    }

    addEndpoints(endpoints: AnyEndpoint[]): void {
        for (let endpoint of endpoints) {
            this.endpoints.push(endpoint);
            this.handleEndpoint(endpoint);
        }
    }

    private serveDocs(): void {
        const endpoints = Array.from(this.endpoints.values());
        const openAPIInterpreter = new OpenAPIInterpreter();
        const openAPIJSON = openAPIInterpreter.generateDocs(endpoints);
        this.expressApp!.use("/api-docs", swaggerUIExpress.serve, swaggerUIExpress.setup(openAPIJSON));
    }

    listen(port: number): Server {
        if (!this.expressApp) {
            throw new Error("Please call createServer method first.");
        } else {
            this.serveDocs();
            return this.expressApp.listen(port, () => {
                console.log(`Server is up running on port ${port}`);
            });
        }
    }
}
