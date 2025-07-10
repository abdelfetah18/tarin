import { expect, test, describe } from 'vitest';
import supertest from "supertest";
import Tarin from "../src/Tarin";
import { AnyEndpoint, endpoint } from "../src/Endpoint";
import * as SchemaValidator from "../src/SchemaValidator";
import Result from "../src/Result";


describe("Tarin Class", () => {
    test("should create server", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.get("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic(_ => {
                    return Result.success({ body: { message: "Hello World" } });
                })
        );

        const response = await supertest(server).get("/");

        expect(response.status).toBe(200);
    });

    test("should add endpoint", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.get("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hi" } }))
        );

        const response = await supertest(server).get("/");

        expect(response.body.message).toBe("Hi");
    });

    test("should add list of endpoints", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoints([
            endpoint.get("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hi" } })),
            endpoint.post("/user")
                .input({
                    body: SchemaValidator.object({
                        id: SchemaValidator.number()
                    }),
                })
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "user" } }))
        ]);

        const response = await supertest(server).get("/");
        const responseA = await supertest(server).post("/user").send({ id: 1 });

        expect(response.body.message).toBe("Hi");
        expect(responseA.body.message).toBe("user");
    });

    test("should not add list of endpoints before creating server", () => {
        const app = new Tarin();

        const errorFn = () => {
            app.addEndpoints([
                endpoint.get("/")
                    .output({
                        body: SchemaValidator.object({ message: SchemaValidator.string() })
                    })
                    .handleLogic((_) => Result.success({ body: { message: "Hi" } })),
                endpoint.get("/user")
                    .output({
                        body: SchemaValidator.object({ message: SchemaValidator.string() })
                    })
                    .handleLogic((_) => Result.success({ body: { message: "user" } }))
            ])
        };

        expect(errorFn).toThrow();
    });

    test("should not add endpoint before creating server", () => {
        const app = new Tarin();

        const errorFn = () => {
            app.addEndpoint(
                endpoint.get("/")
                    .output({
                        body: SchemaValidator.object({ message: SchemaValidator.string() })
                    })
                    .handleLogic((_) => Result.success({ body: { message: "Hi" } }))
            )
        };

        expect(errorFn).toThrow();
    });

    test("should not call listen before creating server", () => {
        const app = new Tarin();

        const errorFn = () => {
            app.listen(3001)
        };

        expect(errorFn).toThrow();
    });

    test("should call listen successfully", async () => {
        const app = new Tarin();
        const server = app.createServer();

        app.addEndpoint(
            endpoint.get("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hi" } }))
        );

        const response = await supertest(server).get("/");

        expect(response.body.message).toBe("Hi");

        server.close();
    });

    test("should serve get endpoint", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.get("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hello World" } }))
        );

        const response = await supertest(server).get("/");

        expect(response.body.message).toBe("Hello World");
    });

    test("should serve post endpoint", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.post("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hello World" } }))
        );

        const response = await supertest(server).post("/");

        expect(response.body.message).toBe("Hello World");
    });

    test("should serve delete endpoint", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.delete("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hello World" } }))
        );

        const response = await supertest(server).delete("/");

        expect(response.body.message).toBe("Hello World");
    });

    test("should serve patch endpoint", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.patch("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hello World" } }))
        );

        const response = await supertest(server).patch("/");

        expect(response.body.message).toBe("Hello World");
    });

    test("should serve head endpoint", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.head("/")
                .output({
                    headers: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ headers: { message: "Hello World" } }))
        );

        const response = await supertest(server).head("/");

        expect(response.headers.message).toBe("Hello World");
    });

    test("should serve options endpoint", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.options("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hello World" } }))
        );

        const response = await supertest(server).options("/");

        expect(response.body.message).toBe("Hello World");
    });

    test("should serve put endpoint", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.put("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hello World" } }))
        );

        const response = await supertest(server).put("/");

        expect(response.body.message).toBe("Hello World");
    });

    test("should serve trace endpoint", async () => {
        const app = new Tarin();

        const server = app.createServer();

        app.addEndpoint(
            endpoint.trace("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => Result.success({ body: { message: "Hello World" } }))
        );

        const response = await supertest(server).trace("/");

        expect(response.body.message).toBe("Hello World");
    });
});
