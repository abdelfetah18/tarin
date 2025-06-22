import { AnyEndpoint, endpoint } from "./Endpoint";
import { createServer, Server } from "http";
import OpenAPIInterpreter from "./OpenAPI/OpenAPIInterpreter";
import swaggerUIDist from "swagger-ui-dist";
import Router from "./Router";
import Route from "./Route";
import { Result, SchemaValidator } from ".";

export default class Tarin {
    router: Router;
    server?: Server;

    constructor() {
        this.router = new Router();
    }

    createServer(): Server {
        this.server = createServer(async (req, res) => {
            // console.log(req.method, req.url);
            const chunks: Buffer[] = [];

            req.on("data", (chunk: Buffer) => {
                chunks.push(chunk);
                // console.log({ event: "data", data: chunk });
            });

            req.on("end", () => {
                // console.log({ event: "end" });
                req.body = Buffer.concat(chunks);
                this.router.handle(req, res);
            });

            req.on("error", (error) => {
                // console.log({ event: "error", data: error });
            });

            req.on("close", () => {
                // console.log({ event: "close" });
            });

            req.on("pause", () => {
                // console.log({ event: "pause" });
            });

            req.on("readable", () => {
                req.read();
                // console.log({ event: "readable" });

            });

            req.on("resume", () => {
                // console.log({ event: "resume" });
            });
        });

        return this.server;
    }

    addEndpoint(endpoint: AnyEndpoint): void {
        if (!this.server) {
            throw new Error("Should not call addEndpoint before createServer");
        }

        this.router.addRoute(new Route(endpoint));
    }

    addEndpoints(endpoints: AnyEndpoint[]): void {
        if (!this.server) {
            throw new Error("Should not call addEndpoints before createServer");
        }

        for (let endpoint of endpoints) {
            this.router.addRoute(new Route(endpoint));
        }
    }

    private serveDocs(): void {
        const endpoints = Array.from(this.router.routes.map(route => route.endpoint).values());
        const openAPIInterpreter = new OpenAPIInterpreter();
        const openAPIJSON = openAPIInterpreter.generateDocs(endpoints);

        this.addEndpoint(
            endpoint.get("/api-docs")
                .output({
                    body: SchemaValidator.object({})
                })
                .handleLogic(_ => {
                    return Result.success({ body: openAPIJSON });
                })
        )

        console.log("swaggerUIDist.absolutePath():", swaggerUIDist.absolutePath());
    }

    listen(port: number): void {
        if (!this.server) {
            throw new Error("Should not call listen before createServer");
        }

        this.serveDocs();

        this.server.listen(port, () => {
            console.log(`Server is up running on port ${port}`);
        });
    }
}
