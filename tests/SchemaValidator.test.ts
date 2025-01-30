import multer from "multer";
import { SchemaObject } from "../src/OpenAPI";
import * as SchemaValidator from "../src/SchemaValidator";
import { Readable } from "stream";

describe("SchemaValidator Class", () => {
    test("should validates a string value successfully", async () => {
        const stringSchema = SchemaValidator.string();
        const errors = stringSchema.validate("HelloWorld");

        expect(errors).toBeNull();
    });

    test("should returns an error for non-string input in string schema", async () => {
        const stringSchema = SchemaValidator.string();
        const errors = stringSchema.validate(true);

        const expected = { message: `Expected a string, but found boolean` };

        expect(errors).toEqual(expected);
    });

    test("should parses a string value successfully", async () => {
        const stringSchema = SchemaValidator.string();
        const result = stringSchema.parse(1337);

        expect(result.value).toEqual("1337");
    });

    test("should returns an error for null input in string schema parsing", async () => {
        const stringSchema = SchemaValidator.string();
        const result = stringSchema.parse(null);

        const expected = { message: "data is missing" };

        expect(result.error).toEqual(expected);
    });

    test("should converts a string schema to an openapi specification", async () => {
        const stringSchema = SchemaValidator.string().optional();
        const result = stringSchema.toOpenApiSchema();

        const schema = new SchemaObject("string");
        schema.optional();
        const expected = schema.toJSON();

        expect(result.toJSON()).toEqual(expected);
    });

    test("should resolves the type of a string schema", async () => {
        const stringSchema = SchemaValidator.string();
        const result = stringSchema.resolveType();

        const expected = "string";

        expect(result).toEqual(expected);
    });

    test("should returns an error when the string exceeds the maximum allowed length", async () => {
        const stringSchema = SchemaValidator.string().max(6);
        const result = stringSchema.validate("HelloWorld");

        const expected = { message: "Exceeded maximum allowed string length of 6" };

        expect(result).toEqual(expected);
    });

    test("should returns an error when the string is shorter than the minimum required length", async () => {
        const stringSchema = SchemaValidator.string().min(5);
        const result = stringSchema.validate("Hi");

        const expected = { message: "String length must be at least 5 characters" };

        expect(result).toEqual(expected);
    });

    test("should returns an error when the string does not match the expected length", async () => {
        const stringSchema = SchemaValidator.string().length(8);
        const result = stringSchema.validate("Hello");

        const expected = { message: "String must be exactly 8 characters long" };

        expect(result).toEqual(expected);
    });

    test("should returns an error when the string is not a valid URL", async () => {
        const stringSchema = SchemaValidator.string().url();
        const result = stringSchema.validate("invalid-url");

        const expected = { message: "Invalid URL format" };

        expect(result).toEqual(expected);
    });

    test("should returns an error when the string is not a valid UUID", async () => {
        const stringSchema = SchemaValidator.string().uuid();
        const result = stringSchema.validate("invalid-uuid");

        const expected = { message: "Invalid UUID format" };

        expect(result).toEqual(expected);
    });

    test("should returns an error when the string does not match the specified regex pattern", async () => {
        const regexPattern = /^[A-Z]+$/;
        const stringSchema = SchemaValidator.string().regex(regexPattern);
        const result = stringSchema.validate("hello");

        const expected = { message: "String does not match the required pattern" };

        expect(result).toEqual(expected);
    });

    test("should returns an error when the string does not include the required substring", async () => {
        const stringSchema = SchemaValidator.string().includes("test");
        const result = stringSchema.validate("hello world");

        const expected = { message: 'String must contain "test"' };

        expect(result).toEqual(expected);
    });

    test("should returns an error when the string does not start with the required prefix", async () => {
        const stringSchema = SchemaValidator.string().startsWith("Hello");
        const result = stringSchema.validate("World Hello");

        const expected = { message: 'String must start with "Hello"' };

        expect(result).toEqual(expected);
    });

    test("should returns an error when the string does not end with the required suffix", async () => {
        const stringSchema = SchemaValidator.string().endsWith("World");
        const result = stringSchema.validate("Hello there");

        const expected = { message: 'String must end with "World"' };

        expect(result).toEqual(expected);
    });

    test("should validates a number value successfully", async () => {
        const numberSchema = SchemaValidator.number();
        const errors = numberSchema.validate(0x1337);

        expect(errors).toBeNull();
    });

    test("should returns an error for non-number input in number schema", async () => {
        const numberSchema = SchemaValidator.number();
        const errors = numberSchema.validate(true);

        const expected = { message: `Expected a number, but found boolean` };

        expect(errors).toEqual(expected);
    });

    test("should parses a number value successfully", async () => {
        const numberSchema = SchemaValidator.number();
        const result = numberSchema.parse("1337");

        expect(result.value).toEqual(1337);
    });

    test("should returns an error for null input in number schema parsing", async () => {
        const numberSchema = SchemaValidator.number();
        const result = numberSchema.parse(null);

        const expected = { message: "data is missing" };

        expect(result.error).toEqual(expected);
    });

    test("should converts a number schema to an openapi specification", async () => {
        const numberSchema = SchemaValidator.number().optional();
        const result = numberSchema.toOpenApiSchema();

        const schema = new SchemaObject("number");
        schema.optional();
        const expected = schema.toJSON();

        expect(result.toJSON()).toEqual(expected);
    });

    test("should resolves the type of a number schema", async () => {
        const numberSchema = SchemaValidator.number();
        const result = numberSchema.resolveType();

        const expected = "number";

        expect(result).toEqual(expected);
    });

    test("should validates a boolean value successfully", async () => {
        const booleanSchema = SchemaValidator.boolean();
        const errors = booleanSchema.validate(true);

        expect(errors).toBeNull();
    });

    test("should returns an error for non-boolean input in boolean schema", async () => {
        const booleanSchema = SchemaValidator.boolean();
        const errors = booleanSchema.validate(0x1337);

        const expected = { message: `Expected a boolean, but found number` };

        expect(errors).toEqual(expected);
    });

    test("should parses a boolean value successfully", async () => {
        const booleanSchema = SchemaValidator.boolean();
        const result = booleanSchema.parse("true");

        expect(result.value).toEqual(true);
    });

    test("should returns an error for null input in boolean schema parsing", async () => {
        const booleanSchema = SchemaValidator.boolean();
        const result = booleanSchema.parse(null);

        const expected = { message: "data is missing" };

        expect(result.error).toEqual(expected);
    });

    test("should converts a boolean schema to an openapi specification", async () => {
        const booleanSchema = SchemaValidator.boolean().optional();
        const result = booleanSchema.toOpenApiSchema();

        const schema = new SchemaObject("boolean");
        schema.optional();
        const expected = schema.toJSON();

        expect(result.toJSON()).toEqual(expected);
    });

    test("should resolves the type of a boolean schema", async () => {
        const booleanSchema = SchemaValidator.boolean();
        const result = booleanSchema.resolveType();

        const expected = "boolean";

        expect(result).toEqual(expected);
    });

    test("should validates array values successfully", async () => {
        const arraySchema = SchemaValidator.array(SchemaValidator.object({
            username: SchemaValidator.string()
        }));
        const errors = arraySchema.validate([{ username: "Tarin" }]);

        expect(errors).toBeNull();
    });

    test("should returns an error for non-array input in array schema", async () => {
        const arraySchema = SchemaValidator.array(SchemaValidator.object({
            username: SchemaValidator.string()
        }));
        const errors = arraySchema.validate(true);

        const expected = [{ message: `Expected a array, but found boolean` }];

        expect(errors).toEqual(expected);
    });

    test("should returns an errors list for non valid input in array schema", async () => {
        const arraySchema = SchemaValidator.array(SchemaValidator.object({
            username: SchemaValidator.string()
        }));
        const errors = arraySchema.validate([{ username: true }]);

        const expected = [{ username: { message: `Expected a string, but found boolean` } }];

        expect(errors).toEqual(expected);
    });

    test("should parses a array values successfully", async () => {
        const arraySchema = SchemaValidator.array(SchemaValidator.object({
            username: SchemaValidator.string()
        }));

        const result = arraySchema.parse([{ username: "Tarin" }]);

        expect(result.value).toEqual([{ username: "Tarin" }]);
    });

    test("should returns an error for null input in array schema parsing", async () => {
        const arraySchema = SchemaValidator.array(SchemaValidator.object({
            username: SchemaValidator.string()
        }));
        const result = arraySchema.parse(null);

        const expected = [{ message: "data is missing" }];

        expect(result.error).toEqual(expected);
    });

    test("should returns an error for non-array input in array schema parsing", async () => {
        const arraySchema = SchemaValidator.array(SchemaValidator.object({
            username: SchemaValidator.string()
        }));
        const result = arraySchema.parse({ username: "Tarin" });

        const expected = [{ message: "Expected array found object" }];

        expect(result.error).toEqual(expected);
    });

    test("should returns an errors list for non valid input in array schema parsing", async () => {
        const arraySchema = SchemaValidator.array(SchemaValidator.object({
            username: SchemaValidator.string()
        }));
        const result = arraySchema.parse([{}]);

        const expected = [{ username: { message: "data is missing" } }];

        expect(result.error).toEqual(expected);
    });

    test("should converts a array schema to an openapi specification", async () => {
        const arraySchema = SchemaValidator.array(SchemaValidator.string()).optional();
        const result = arraySchema.toOpenApiSchema();

        const arraySchemaObject = new SchemaObject("array");
        arraySchemaObject.optional();
        arraySchemaObject.setArrayItemsSchema(new SchemaObject("string"));

        const expected = arraySchemaObject.toJSON();

        expect(result.toJSON()).toEqual(expected);
    });

    test("should resolves the type of a array schema", async () => {
        const arraySchema = SchemaValidator.array(SchemaValidator.string());
        const result = arraySchema.resolveType();

        const expected = "string";

        expect(result).toEqual(expected);
    });

    test("should validates an object with correct structure successfully", async () => {
        const objectSchema = SchemaValidator.object({ message: SchemaValidator.string() });
        const errors = objectSchema.validate({ message: "HelloWorld" });

        expect(errors).toBeNull();
    });

    test("should returns an error for an object with incorrect property types in object schema", async () => {
        const objectSchema = SchemaValidator.object({ message: SchemaValidator.string() });
        const errors = objectSchema.validate({ message: 12 });

        const expected = { message: { message: `Expected a string, but found number` } };

        expect(errors).toEqual(expected);
    });

    test("should parses an object with valid input successfully", async () => {
        const objectSchema = SchemaValidator.object({
            message: SchemaValidator.string(),
            statusCode: SchemaValidator.number(),
        });

        const result = objectSchema.parse({ message: "HelloWorld", statusCode: "200" });

        const expected = { message: "HelloWorld", statusCode: 200 };

        expect(result.value).toEqual(expected);
    });

    test("should parses an object with valid input successfully and ignore other properties", async () => {
        const objectSchema = SchemaValidator.object({
            message: SchemaValidator.string(),
            statusCode: SchemaValidator.number(),
        });

        const result = objectSchema.parse({ message: "HelloWorld", statusCode: "200", ignored: "ignored" });

        const expected = { message: "HelloWorld", statusCode: 200 };

        expect(result.value).toEqual(expected);
    });

    test("should converts a object schema to an openapi specification", async () => {
        const objectSchema = SchemaValidator.object({ username: SchemaValidator.string() }).optional();
        const result = objectSchema.toOpenApiSchema();

        const objectSchemaObject = new SchemaObject("object");
        objectSchemaObject.optional();
        objectSchemaObject.addPropertie("username", new SchemaObject("string"));

        const expected = objectSchemaObject.toJSON();

        expect(result.toJSON()).toEqual(expected);
    });

    test("should resolves the type of a object schema", async () => {
        const objectSchema = SchemaValidator.object({ username: SchemaValidator.string() });
        const result = objectSchema.resolveType();

        const expected = { username: "string" };

        expect(result).toEqual(expected);
    });

    test("should validates a file value successfully", async () => {
        const fileSchema = SchemaValidator.file({ maxSize: 20 });
        const buffer = Buffer.from("HelloWorld");
        const file: SchemaValidator.File = {
            buffer,
            mimetype: "plain/text",
            size: buffer.length,
            fieldname: "file",
        };

        const errors = fileSchema.validate(file);

        expect(errors).toBeNull();
    });

    test("should throw an error when attempting to parse a file, as parsing is not supported", async () => {
        const fileSchema = SchemaValidator.file({});
        expect(() => fileSchema.parse(undefined)).toThrow();
    });

    test("should converts a file schema to an openapi specification", async () => {
        const fileSchema = SchemaValidator.file({}).optional();
        const result = fileSchema.toOpenApiSchema();

        const schema = new SchemaObject("string", "binary");
        schema.optional();
        const expected = schema.toJSON();

        expect(result.toJSON()).toEqual(expected);
    });

    test("should resolves the type of a file schema", async () => {
        const fileSchema = SchemaValidator.file({});
        const result = fileSchema.resolveType();

        const expected = "file";

        expect(result).toEqual(expected);
    });
});
