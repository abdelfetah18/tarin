import { expect, test, describe } from 'vitest';
import { SchemaValidator } from "../src";
import { InputSchemas } from "../src/Endpoint";
import InputHandler, { InputHandlerErrorType } from "../src/InputHandler";

describe("InputHandler Class", () => {
    const inputHandler = new InputHandler({ username: "Tarin" }, { username: "Tarin" }, { id: "tarin" }, { Authorization: "Bearer token" }, {});
    const schemas: InputSchemas = {
        body: SchemaValidator.object({
            username: SchemaValidator.string(),
        }),
        query: SchemaValidator.object({
            username: SchemaValidator.string(),
        }),
        params: SchemaValidator.object({
            id: SchemaValidator.string(),
        }),
        headers: SchemaValidator.object({
            Authorization: SchemaValidator.string(),
        }),
    };

    test("should validate all inputs", async () => {
        const validationResult = inputHandler.validate(schemas);
        expect(validationResult.isSuccess());
    });

    test("should parse all inputs", async () => {
        const parsingResult = inputHandler.parse(schemas);
        expect(parsingResult.isSuccess());
    });

    test("should fail validation when body is invalid", async () => {
        const validationResult = inputHandler.validate({
            ...schemas,
            body: SchemaValidator.string(),
        });

        expect(validationResult.error!.type == InputHandlerErrorType.Body);
    });

    test("should fail validation when query is invalid", async () => {
        const validationResult = inputHandler.validate({
            ...schemas,
            query: SchemaValidator.object({ id: SchemaValidator.string() }),
        });

        expect(validationResult.error!.type == InputHandlerErrorType.Query);
    });

    test("should fail validation when param is invalid", async () => {
        const validationResult = inputHandler.validate({
            ...schemas,
            params: SchemaValidator.object({ username: SchemaValidator.string() }),
        });

        expect(validationResult.error!.type == InputHandlerErrorType.Params);
    });

    test("should fail validation when header is invalid", async () => {
        const validationResult = inputHandler.validate({
            ...schemas,
            headers: SchemaValidator.object({ username: SchemaValidator.string() }),
        });

        expect(validationResult.error!.type == InputHandlerErrorType.Headers);
    });

    test("should fail validation when file is invalid", async () => {
        const validationResult = inputHandler.validate({
            ...schemas,
            files: SchemaValidator.object({
                file: SchemaValidator.file({})
            }),
        });

        expect(validationResult.error!.type == InputHandlerErrorType.Files);
    });

    test("should fail to parse when body is invalid", async () => {
        const parsingResult = inputHandler.parse({
            ...schemas,
            body: SchemaValidator.object({
                id: SchemaValidator.string()
            }),
        });
        expect(parsingResult.error!.type == InputHandlerErrorType.Body);
    });

    test("should fail to parse when query is invalid", async () => {
        const parsingResult = inputHandler.parse({
            ...schemas,
            query: SchemaValidator.object({ id: SchemaValidator.string() }),
        });

        expect(parsingResult.error!.type == InputHandlerErrorType.Query);
    });

    test("should fail to parse when param is invalid", async () => {
        const parsingResult = inputHandler.parse({
            ...schemas,
            params: SchemaValidator.object({ username: SchemaValidator.string() }),
        });

        expect(parsingResult.error!.type == InputHandlerErrorType.Params);
    });

    test("should fail to parse when header is invalid", async () => {
        const parsingResult = inputHandler.parse({
            ...schemas,
            headers: SchemaValidator.object({ username: SchemaValidator.string() }),
        });

        expect(parsingResult.error!.type == InputHandlerErrorType.Headers);
    });
});
