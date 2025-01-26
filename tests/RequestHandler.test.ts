import supertest from "supertest";
import { endpoint } from "../src/Endpoint";
import Tarin from "../src/Tarin";
import * as SchemaValidator from "../src/SchemaValidator";

describe("RequestHandler Class", () => {
    test("should return an error response when no callback is available in the endpoint", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.get("/"));
        const response = await supertest(server).get("/");

        const expected = { status: "error", message: "No logic sepecfied by the server" };

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual(expected);
    });

    test("should return an error response when both input type and output type are not specified", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.get("/").handleLogic(() => { }));
        const response = await supertest(server).get("/");

        const expected = { status: "error", message: "Both input type and output type were not specified" };

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual(expected);
    });

    test("should return output when output type is specified but input type is not", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(
            endpoint.get("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => {
                    return {
                        body: { message: "HelloWorld" }
                    };
                })
        );

        const response = await supertest(server).get("/");

        const expected = { message: "HelloWorld" };

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expected);
    });

    test("should handle input and return body errors", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.post("/")
            .input({
                body: SchemaValidator.object({
                    username: SchemaValidator.string()
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() })
            })
            .handleLogic((input) => {
                return {
                    body: { message: `Hello ${input.body.username}` }
                };
            })
        );
        const response = await supertest(server).post("/").send({ username: 1 });

        const expected = {
            data: { username: { message: "Expected a string, but found number" } },
            message: "Invalid body",
            status: "error",
        }


        expect(response.body).toEqual(expected);
    });

    test("should handle input and return query errors", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.get("/")
            .input({
                query: SchemaValidator.object({
                    username: SchemaValidator.string()
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() })
            })
            .handleLogic((input) => {
                return {
                    body: { message: `Hello ${input.query.username}` },
                };
            })
        );
        const response = await supertest(server).get("/");

        const expected = {
            data: { username: { message: "data is missing" } },
            message: "Invalid query",
            status: "error",
        }


        expect(response.body).toEqual(expected);
    });

    test("should handle input params successfully", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.get("/:username")
            .input({
                params: SchemaValidator.object({
                    username: SchemaValidator.string()
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() })
            })
            .handleLogic((input) => {
                return {
                    body: { message: `Hello ${input.params.username}` }
                };
            })
        );
        const response = await supertest(server).get("/Tarin");

        const expected = { message: "Hello Tarin" };

        expect(response.body).toEqual(expected);
    });

    test("should handle input headers successfully", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.get("/:username")
            .input({
                headers: SchemaValidator.object({
                    username: SchemaValidator.string()
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() })
            })
            .handleLogic((input) => {
                return {
                    body: { message: `Hello ${input.headers.username}` }
                };
            })
        );
        const response = (await supertest(server).get("/Tarin").set("username", "Tarin"));

        const expected = { message: "Hello Tarin" };

        expect(response.body).toEqual(expected);
    });

    test("should handle inputs successfully", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.post("/users/:id")
            .input({
                params: SchemaValidator.object({
                    id: SchemaValidator.string()
                }),
                body: SchemaValidator.object({
                    title: SchemaValidator.string()
                }),
                query: SchemaValidator.object({
                    username: SchemaValidator.string()
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() })
            })
            .handleLogic((input) => {
                return {
                    body: { message: `Hello ${input.query.username}, id is ${input.params.id} and title is ${input.body.title}` }
                };
            }));
        const response = await supertest(server).post("/users/1?username=Tarin").send({ title: "Tarin" });

        const expected = { message: "Hello Tarin, id is 1 and title is Tarin" };

        expect(response.body).toEqual(expected);
    });

    test("should handle inputs and return headers successfully", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.get("/:username")
            .input({
                params: SchemaValidator.object({
                    username: SchemaValidator.string()
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() }),
                headers: SchemaValidator.object({ id: SchemaValidator.string() })
            })
            .handleLogic((input) => {
                return {
                    body: { message: `Hello ${input.params.username}` },
                    headers: { id: "TarinID" }
                };
            })
        );

        const response = await supertest(server).get("/Tarin");

        const expected = { message: "Hello Tarin" };

        expect(response.body).toEqual(expected);
        expect(response.headers["id"]).toEqual("TarinID");
    });

    test("should handle input and return files errors", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.post("/")
            .input({
                query: SchemaValidator.object({
                    username: SchemaValidator.string()
                }),
                files: SchemaValidator.object({
                    text: SchemaValidator.file({ maxSize: 10 }),
                    data: SchemaValidator.file({}),
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() })
            })
            .handleLogic((input) => {
                return {
                    body: { message: `Hello ${input.query.username}` },
                };
            })
        );

        const response = await supertest(server).post("/?username=Tarin").attach("text", Buffer.from("Hello, World!"), { filename: "text" });

        const expected = {
            data: {
                text: { message: "the file exceeds the maximum size of 10 bytes" },
                data: { message: "the file is missing" }
            },
            message: "Invalid files",
            status: "error",
        }

        expect(response.body).toEqual(expected);
    });

    test("should handle inputs and return files successfully", async () => {
        const app = new Tarin();
        const server = app.createServer();
        const httpServer = app.listen(3000);
        const buffer = Buffer.from("HelloWorld");
        app.addEndpoint(endpoint.get("/file")
            .input({
                query: SchemaValidator.object({
                    username: SchemaValidator.string(),
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() }),
                files: SchemaValidator.object({
                    file: SchemaValidator.file({})
                }),
            })
            .handleLogic((_) => {
                return {
                    body: { message: `Hello World` },
                    files: { file: { buffer, fieldname: "file", mimetype: "plain/text", size: buffer.length } }
                };
            })
        );

        const response = await fetch("http://127.0.0.1:3000/file?username=Tarin");
        const formData = await response.formData();
        const file = formData.get("file") as File;

        const expected = { message: "Hello World" };

        expect(JSON.parse(formData.get("data")?.toString() || "{}")).toEqual(expected);

        expect(file.size).toBe(10);
        expect(file.type).toBe("application/octet-stream");

        httpServer.close();
    });

    test("should return defined error", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.get("/:username")
            .input({
                params: SchemaValidator.object({
                    username: SchemaValidator.string()
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() })
            })
            .error(SchemaValidator.object({
                message: SchemaValidator.string()
            }))
            .handleLogic((input, error) => {
                if (input.params.username == "admin") {
                    error({ message: "admin username is not allowed" });
                }

                return {
                    body: { message: `Hello ${input.params.username}` }
                };
            })
        );
        const response = await supertest(server).get("/admin");

        const expected = { message: "admin username is not allowed" };

        expect(response.body).toEqual(expected);
    });
});
