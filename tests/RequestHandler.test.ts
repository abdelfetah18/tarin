import supertest from "supertest";
import { endpoint } from "../src/Endpoint";
import Tarin from "../src/Tarin";
import * as SchemaValidator from "../src/SchemaValidator";
import Result from "../src/Result";

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

    test("should return output when output type is specified but input type is not", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(
            endpoint.get("/")
                .output({
                    body: SchemaValidator.object({ message: SchemaValidator.string() })
                })
                .handleLogic((_) => {
                    return Result.success({
                        body: { message: "HelloWorld" }
                    });
                })
        );

        const response = await supertest(server).get("/");

        const expected = { message: "HelloWorld" };

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expected);
    });

    test("should fail validation when input is invalid", async () => {
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
                return Result.success({
                    body: { message: `Hello ${input.body.username}` }
                });
            })
        );
        const response = await supertest(server).post("/").send({ username: 1 });

        expect(response.body.status).toEqual("error");
    });

    test("should fail to parse when input is invalid", async () => {
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
                return Result.success({
                    body: { message: `Hello ${input.body.username}` }
                });
            })
        );
        const response = await supertest(server).post("/").send({ id: "tarin" });

        expect(response.body.status).toEqual("error");
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
                return Result.success({
                    body: { message: `Hello ${input.query.username}` },
                });
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

    test("should handle input and return query validation errors", async () => {
        const app = new Tarin();
        const server = app.createServer();
        app.addEndpoint(endpoint.get("/")
            .input({
                query: SchemaValidator.object({
                    username: SchemaValidator.string().max(4)
                })
            })
            .output({
                body: SchemaValidator.object({ message: SchemaValidator.string() })
            })
            .handleLogic((input) => {
                return Result.success({
                    body: { message: `Hello ${input.query.username}` },
                });
            })
        );
        const response = await supertest(server).get("/?username=tarin");

        const expected = {
            data: { username: { message: "Exceeded maximum allowed string length of 4" } },
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
                return Result.success({
                    body: { message: `Hello ${input.params.username}` }
                });
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
                return Result.success({
                    body: { message: `Hello ${input.headers.username}` }
                });
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
                return Result.success({
                    body: { message: `Hello ${input.query.username}, id is ${input.params.id} and title is ${input.body.title}` }
                });
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
                return Result.success({
                    body: { message: `Hello ${input.params.username}` },
                    headers: { id: "TarinID" }
                });
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
                return Result.success({
                    body: { message: `Hello ${input.query.username}` },
                });
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
                return Result.success({
                    body: { message: `Hello World` },
                    files: { file: { buffer, filename: "file", mimetype: "plain/text", size: buffer.length } }
                });
            })
        );

        const response = await fetch("http://127.0.0.1:3000/file?username=Tarin");
        const formData = await response.formData();
        const file = formData.get("file") as File;

        const expected = { message: "Hello World" };

        expect(JSON.parse(formData.get("data")?.toString() || "{}")).toEqual(expected);

        expect(file.size).toBe(10);
        expect(file.type).toBe("application/octet-stream");

        server.close();
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
            .handleLogic((input) => {
                if (input.params.username == "admin") {
                    return Result.failure({ message: "admin username is not allowed" });
                }

                return Result.success({
                    body: { message: `Hello ${input.params.username}` }
                });
            })
        );
        const response = await supertest(server).get("/admin");

        const expected = { message: "admin username is not allowed" };

        expect(response.body).toEqual(expected);
    });

    test("should support asynchronous callbacks", async () => {
        const app = new Tarin();
        const server = app.createServer();

        const messagePromise = new Promise(resolve => {
            resolve("Hello");
        });

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
            .handleLogic(async (input) => {
                const message = await messagePromise;
                return Result.success({
                    body: { message: `${message} ${input.params.username}` }
                });
            })
        );
        const response = await supertest(server).get("/tarin");

        const expected = { message: "Hello tarin" };

        expect(response.body).toEqual(expected);
    });

    test("should support middleware", async () => {
        const app = new Tarin();
        const server = app.createServer();

        app.addEndpoint(endpoint.get("/:username")
            .input({
                params: SchemaValidator.object({
                    username: SchemaValidator.string()
                })
            })
            .output({
                body: SchemaValidator.object({
                    message: SchemaValidator.string()
                })
            })
            .middleware(
                SchemaValidator.object({
                    messageA: SchemaValidator.string()
                }),
                (input) => {
                    return Result.success({ messageA: `Hello ${input.params.username}` });
                })
            .middleware(
                SchemaValidator.object({
                    messageB: SchemaValidator.string()
                }),
                (input) => {
                    return Result.success({ messageB: `${input.middleware.messageA}, How are you?` });
                })
            .handleLogic((input) => {
                return Result.success({
                    body: {
                        message: input.middleware.messageB
                    }
                });
            })
        );

        const response = await supertest(server).get("/tarin");

        const expected = { message: "Hello tarin, How are you?" };

        expect(response.body).toEqual(expected);
    });

    test("should fail to handle input when its invalid on middleware", async () => {
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
            .middleware(
                SchemaValidator.object({
                    message: SchemaValidator.string()
                }),
                (input) => {
                    return Result.success({ message: `Hi ${input.body.username}` });
                })
            .handleLogic((input) => {
                return Result.success({
                    body: { message: input.middleware.message }
                });
            })
        );
        const response = await supertest(server).post("/").send({ id: "tarin" });

        expect(response.body.status).toEqual("error");
    });

    test("should return error on middleware", async () => {
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
            .error(SchemaValidator.object({ message: SchemaValidator.string() }))
            .middleware(
                SchemaValidator.object({
                    message: SchemaValidator.string()
                }),
                (input) => {
                    if (input.body.username != "Tarin") {
                        return Result.failure({ message: "Wrong username" })
                    }
                    return Result.success({ message: `Hi ${input.body.username}` });
                })
            .handleLogic((input) => {
                return Result.success({
                    body: { message: input.middleware.message }
                });
            })
        );
        const response = await supertest(server).post("/").send({ username: "user" });

        const expected = { message: "Wrong username" };
        expect(response.body).toEqual(expected);
    });
});
