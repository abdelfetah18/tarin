import * as SchemaValidator from "../src/SchemaValidator";
import OpenAPIInterpreter from "../src/OpenAPI/OpenAPIInterpreter";
import { endpoint } from "../src/Endpoint";

describe("OpenAPIInterpreter Class", () => {
    const openAPIInterpreter = new OpenAPIInterpreter();

    test("should generates an empty open-api specification", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {},
        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a simple query input in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/").input({
                query: SchemaValidator.object({
                    id: SchemaValidator.number(),
                    username: SchemaValidator.string(),
                    isAdmin: SchemaValidator.boolean(),
                })
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    get: {
                        parameters: [
                            {
                                in: "query",
                                name: "id",
                                required: true,
                            },
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                            {
                                in: "query",
                                name: "isAdmin",
                                required: true,
                            },
                        ],

                    },
                },
            },
        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a simple optional query input in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/").input({
                query: SchemaValidator.object({
                    id: SchemaValidator.number().optional(),
                    username: SchemaValidator.string(),
                    isAdmin: SchemaValidator.boolean(),
                })
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    get: {
                        parameters: [
                            {
                                in: "query",
                                name: "id",
                                required: false,
                            },
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                            {
                                in: "query",
                                name: "isAdmin",
                                required: true,
                            },
                        ],

                    },
                },
            },
        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a simple parameter input in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/:username").input({
                params: SchemaValidator.object({ username: SchemaValidator.string() })
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/{username}": {
                    get: {
                        parameters: [
                            {
                                in: "path",
                                name: "username",
                                required: true,
                            },
                        ],

                    },
                },
            },
        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a simple optional parameter input in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/:username").input({
                params: SchemaValidator.object({ username: SchemaValidator.string().optional() })
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/{username}": {
                    get: {
                        parameters: [
                            {
                                in: "path",
                                name: "username",
                                required: false,
                            },
                        ],

                    },
                },
            },
        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a simple body input in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.post("/").input({
                body: SchemaValidator.object({ username: SchemaValidator.string() })
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    post: {
                        parameters: [],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        properties: {
                                            username: {
                                                type: "string",
                                                required: true,
                                            },
                                        },
                                        required: true,
                                        type: "object",
                                    },
                                },
                            }
                        }
                    }
                },
            },
        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a simple optional body input in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.post("/").input({
                body: SchemaValidator.object({ username: SchemaValidator.string().optional() })
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    post: {
                        parameters: [],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        properties: {
                                            username: {
                                                type: "string",
                                                required: false,
                                            },
                                        },
                                        required: true,
                                        type: "object",
                                    },
                                },
                            }
                        }
                    }
                },
            },
        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a simple header input in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/").input({
                headers: SchemaValidator.object({
                    username: SchemaValidator.string(),
                })
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    get: {
                        parameters: [
                            {
                                in: "header",
                                name: "username",
                                required: true,
                            }
                        ],

                    },
                },
            },
        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a simple optional header input in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/").input({
                headers: SchemaValidator.object({
                    username: SchemaValidator.string().optional(),
                })
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    get: {
                        parameters: [
                            {
                                in: "header",
                                name: "username",
                                required: false,
                            }
                        ],

                    },
                },
            },
        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a simple response body in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    get: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a header response in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({
                body: SchemaValidator.object({ username: SchemaValidator.string() }),
                headers: SchemaValidator.object({
                    username: SchemaValidator.string(),
                }),
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    get: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                                headers: {
                                    username: {
                                        required: true,
                                    }
                                }
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification with a optional header response in an operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({
                body: SchemaValidator.object({ username: SchemaValidator.string() }),
                headers: SchemaValidator.object({
                    username: SchemaValidator.string().optional(),
                }),
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    get: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                                headers: {
                                    username: {
                                        required: false,
                                    }
                                }
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for GET operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    get: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for POST operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.post("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    post: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for PUT operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.put("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    put: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for DELETE operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.delete("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    delete: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for HEAD operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.head("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    head: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for PATCH operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.patch("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    patch: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for OPTIONS operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.options("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    options: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for TRACE operation", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.trace("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() })
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    trace: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            },
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for file input", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.post("/").input({
                files: SchemaValidator.object({ file: SchemaValidator.file({}) }),
                body: SchemaValidator.object({ username: SchemaValidator.string() }),
            }).output({ body: SchemaValidator.object({ username: SchemaValidator.string() }) })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    post: {
                        parameters: [],
                        requestBody: {
                            content: {
                                "multipart/form-data": {
                                    schema: {
                                        properties: {
                                            file: {
                                                format: "binary",
                                                type: "string",
                                                required: true,
                                            },
                                            data: {
                                                type: "object",
                                                required: true,
                                                properties: {
                                                    username: {
                                                        type: "string",
                                                        required: true,
                                                    }
                                                }
                                            }
                                        },
                                        type: "object",
                                        required: true,
                                    },
                                },
                            },
                        },
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for file output", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.post("/").input({
                body: SchemaValidator.object({ username: SchemaValidator.string() }),
            }).output({
                body: SchemaValidator.object({ username: SchemaValidator.string() }),
                files: SchemaValidator.object({ file: SchemaValidator.file({}) })
            })
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    post: {
                        parameters: [],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: true,
                                        properties: {
                                            username: {
                                                type: "string",
                                                required: true,
                                            }
                                        }
                                    },
                                },
                            },
                        },
                        responses: {
                            default: {
                                content: {
                                    "multipart/form-data": {
                                        schema: {
                                            properties: {
                                                file: {
                                                    format: "binary",
                                                    type: "string",
                                                    required: true,
                                                },
                                                data: {
                                                    type: "object",
                                                    required: true,
                                                    properties: {
                                                        username: {
                                                            type: "string",
                                                            required: true,
                                                        }
                                                    }
                                                }
                                            },
                                            type: "object",
                                            required: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });

    test("should generates an open-api specification for error response", async () => {
        const openAPISpecification = openAPIInterpreter.generateDocs([
            endpoint.get("/").input({
                query: SchemaValidator.object({ username: SchemaValidator.string() }),
            }).output({
                body: SchemaValidator.object({ username: SchemaValidator.string() })
            }).error(SchemaValidator.object({ message: SchemaValidator.string() }))
        ]);

        const expected = {
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
            openapi: "3.1.0",
            paths: {
                "/": {
                    get: {
                        parameters: [
                            {
                                in: "query",
                                name: "username",
                                required: true,
                            }
                        ],
                        responses: {
                            default: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                username: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                            "400": {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: true,
                                            properties: {
                                                message: {
                                                    type: "string",
                                                    required: true,
                                                }
                                            }
                                        },
                                    },
                                },
                            }
                        },
                    },
                },
            },

        };

        expect(openAPISpecification).toEqual(expected);
    });
});
