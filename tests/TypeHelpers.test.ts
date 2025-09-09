import { expectTypeOf, describe, test } from 'vitest';
import * as SchemaValidator from "../src/SchemaValidator";
import * as TypeHelpers from '../src/types/helpers';

describe("Type Helpers", () => {
    test("GetType should infer schema type", () => {
        type Input = SchemaValidator.TarinObject<{ username: SchemaValidator.TarinString }>;
        type Type = TypeHelpers.GetType<Input>;
        type Expected = { username: string };

        expectTypeOf<Type>().toEqualTypeOf<Expected>();
    });

    test("GetType should return undefined for non-schema types", () => {
        type Type = TypeHelpers.GetType<string>;
        expectTypeOf<Type>().toEqualTypeOf<undefined>();
    });

    test("Simplify should flatten intersected types", () => {
        type Complex = { a: string } & { b: number };
        type Type = TypeHelpers.Simplify<Complex>;
        type Expected = { a: string; b: number };

        expectTypeOf<Type>().toEqualTypeOf<Expected>();
    });

    test("Simplify should pass through primitive types unchanged", () => {
        type Type = TypeHelpers.Simplify<number>;
        expectTypeOf<Type>().toEqualTypeOf<number>();
    });

    test("OnlyRequired should remove optional keys (undefined values)", () => {
        type Input = { a: string; b: number | undefined; c?: string };
        type Type = TypeHelpers.OnlyRequired<Input>;
        type Expected = { a: string };

        expectTypeOf<Type>().toEqualTypeOf<Expected>();
    });

    test("IsExactType should return true for identical types", () => {
        type Type = TypeHelpers.IsExactType<{ a: string }, { a: string }>;
        expectTypeOf<Type>().toEqualTypeOf<true>();
    });

    test("IsExactType should return false for different types", () => {
        type Type = TypeHelpers.IsExactType<{ a: string }, { a: string; b: number }>;
        expectTypeOf<Type>().toEqualTypeOf<false>();
    });

    test("ExcludeIfExact should return undefined if T is exactly U", () => {
        type T = { a: string };
        type U = { a: string };
        type Type = TypeHelpers.ExcludeIfExact<T, U>;
        expectTypeOf<Type>().toEqualTypeOf<undefined>();
    });

    test("ExcludeIfExact should return T if T is not exactly U", () => {
        type T = { a: string; b: number };
        type U = { a: string };
        type Type = TypeHelpers.ExcludeIfExact<T, U>;
        expectTypeOf<Type>().toEqualTypeOf<T>();
    });

    test("ExcludeTarinTypeIfExact should return undefined if type matches TarinSupportedType", () => {
        type T = { [K in string]: SchemaValidator.TarinSupportedType };
        type Type = TypeHelpers.ExcludeTarinTypeIfExact<T>;
        expectTypeOf<Type>().toEqualTypeOf<undefined>();
    });

    test("ExcludeTarinTypeIfExact should return T if not exact TarinSupportedType", () => {
        type T = { username: SchemaValidator.TarinString; age: number };
        type Type = TypeHelpers.ExcludeTarinTypeIfExact<T>;
        expectTypeOf<Type>().toEqualTypeOf<T>();
    });

    test("ExcludeTarinLiteralTypeIfExact should return undefined if exact literal type", () => {
        type T = { [K in string]: SchemaValidator.TarinSupportedLiteralType };
        type Type = TypeHelpers.ExcludeTarinLiteralTypeIfExact<T>;
        expectTypeOf<Type>().toEqualTypeOf<undefined>();
    });


    test("ExcludeTarinLiteralTypeIfExact should return T if not exact literal type", () => {
        type T = { x: SchemaValidator.TarinSupportedLiteralType; y: string };
        type Type = TypeHelpers.ExcludeTarinLiteralTypeIfExact<T>;
        expectTypeOf<Type>().toEqualTypeOf<T>();
    });
});
