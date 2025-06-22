import { IncomingMessage, ServerResponse } from "http";
import Route from "./Route";
import ResponseHandler, { Response } from "./ResponseHandler";

export default class Router {
    routes: Route[];

    constructor() {
        this.routes = [];
    }

    addRoute(route: Route) {
        this.routes.push(route);
    }

    async handle(request: IncomingMessage, response: Response): Promise<void> {
        const responseHandler = new ResponseHandler(response);
        const method = request.method || "";
        const url = new URL(`http://localhost${request.url}`);

        // 1. Match Endpoint
        let didMatch = false;
        for (let route of this.routes) {
            if (route.isStatic && url.pathname.startsWith(route.endpoint.path)) {
                didMatch = true;
                await route.handleStatic(request, response);
                break;
            }

            if (!route.isStatic && route.match(method, url.pathname)) {
                didMatch = true;
                await route.handle(request, response);
                break;
            }
        }

        if (!didMatch) {
            responseHandler.status(404).json({
                status: "error",
                message: "Path Not Found",
            });
            return;
        }
    }
}