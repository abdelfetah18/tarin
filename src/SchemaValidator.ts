import Result from "./Result";
import { SchemaObject } from "./OpenAPI/index";
import { readFileSync } from "fs";

export type TypeOf<T extends AnyTarinType> = T["_type"]
export type TypeOfObject<T extends TarinTypeMap> = { [K in keyof T]: TypeOf<T[K]>; }

export type AnyTarinType = TarinType<TarinSupportedType, TarinTypeDef, TarinTypeError>
export type LiteralTarinType = TarinType<TarinSupportedLiteralType, TarinTypeDef, TarinTypeError>

export type TarinTypeMap = { [k: string]: AnyTarinType }
export type TarinLiteralTypeMap = { [k: string]: LiteralTarinType }
export type GenericTarinTypeMap<T extends AnyTarinType> = { [k: string]: T }

export type TarinDataType = "string" | "number" | "boolean" | "array" | "object" | "file";

export type TarinSchemaObjectShape = { [key in string]: TarinSchemaShape; };
export type TarinSchemaShape = "string" | "number" | "boolean" | TarinSchemaObjectShape | "file";

export type TarinSupportedType = string | number | boolean | TypeOfObject<TarinTypeMap> | TypeOfObject<TarinTypeMap>[] | File | undefined | TarinSupportedType[];
export type TarinSupportedLiteralType = string | number | boolean | undefined;

export type TarinError = { message: string; }
export type TarinObjectError = { [key in string]: TarinTypeError }
export type TarinTypeError = TarinError | TarinObjectError | TarinTypeError[]

export abstract class TarinType<
    Type extends TarinSupportedType,
    Def extends TarinTypeDef,
    Error extends TarinTypeError
> {
    readonly _type!: Type;
    readonly _def!: Def;
    abstract type: TarinDataType;
    required: boolean = true;

    constructor(def: Def) {
        this._def = def;
    }

    abstract resolveType(): TarinSchemaShape;
    abstract toOpenApiSchema(): SchemaObject;
    abstract validate(data: any): Error | null;
    abstract parse(data: any): Result<Error, Type>;
    optional() {
        this.required = false;
        return this as TarinType<Type | undefined, Def, Error>;
    };
}

export type TarinTypeDef = TarinStringDef | TarinNumberDef | TarinBooleanDef | TarinObjectDef<any> | TarinArrayDef<any>;

interface TarinStringDef { }
interface TarinNumberDef { }
interface TarinBooleanDef { }
interface TarinObjectDef<T> { shape: T }
interface TarinArrayDef<T> { shape: T }
interface TarinFileDef { maxSize?: number; };

export class TarinString extends TarinType<string, TarinStringDef, TarinError> {
    type: TarinDataType = "string";

    private _max?: number;
    private _min?: number;
    private _length?: number;
    private _url: boolean = false;
    private _uuid: boolean = false;
    private _regex?: RegExp;
    private _includes?: string;
    private _startsWith?: string;
    private _endsWith?: string;

    static create(): TarinString {
        return new TarinString({});
    }

    resolveType(): TarinSchemaShape {
        return "string";
    }

    toOpenApiSchema(): SchemaObject {
        const schema = new SchemaObject("string");
        if (!this.required) {
            schema.optional();
        }

        return schema;
    }

    validate(data: any): TarinError | null {
        if (typeof data != "string") {
            return { message: `Expected a string, but found ${typeof data}` };
        }

        if (this._max && data.length > this._max) {
            return { message: `Exceeded maximum allowed string length of ${this._max}` };
        }

        if (this._min && data.length < this._min) {
            return { message: `String length must be at least ${this._min} characters` };
        }

        if (this._length && data.length !== this._length) {
            return { message: `String must be exactly ${this._length} characters long` };
        }

        if (this._url) {
            try {
                new URL(data);
            } catch (error) {
                return { message: `Invalid URL format` };
            }
        }

        if (this._uuid) {
            const result = data.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
            if (!result) {
                return { message: `Invalid UUID format` };
            }
        }

        if (this._regex) {
            const result = data.match(this._regex);
            if (!result) {
                return { message: `String does not match the required pattern` };
            }
        }

        if (this._includes && !data.includes(this._includes)) {
            return { message: `String must contain "${this._includes}"` };
        }

        if (this._startsWith && !data.startsWith(this._startsWith)) {
            return { message: `String must start with "${this._startsWith}"` };
        }

        if (this._endsWith && !data.endsWith(this._endsWith)) {
            return { message: `String must end with "${this._endsWith}"` };
        }

        return null;
    }

    parse(data: any): Result<TarinError, string> {
        if (!data) {
            return Result.failure<TarinError, string>({ message: "data is missing" });
        }

        return Result.success<TarinError, string>(String(data));
    }

    max(value: number) { this._max = value; return this; }
    min(value: number) { this._min = value; return this; }
    length(value: number) { this._length = value; return this; }
    url() { this._url = true; return this; }
    uuid() { this._uuid = true; return this; }
    regex(value: RegExp) { this._regex = value; return this; }
    includes(value: string) { this._includes = value; return this; }
    startsWith(value: string) { this._startsWith = value; return this; }
    endsWith(value: string) { this._endsWith = value; return this; }
}

export class TarinNumber extends TarinType<number, TarinNumberDef, TarinError> {
    type: TarinDataType = "number";

    _gt?: number;
    _gte?: number;
    _lt?: number;
    _lte?: number;
    _integer: boolean = false;
    _positive: boolean = false;
    _nonnegative: boolean = false;
    _negative: boolean = false;
    _nonpositive: boolean = false;
    _multipleOf?: number;

    static create(): TarinNumber {
        return new TarinNumber({});
    }

    resolveType(): TarinSchemaShape {
        return "number"
    }

    toOpenApiSchema(): SchemaObject {
        const schema = new SchemaObject("number");
        if (!this.required) {
            schema.optional();
        }

        return schema;
    }

    validate(data: any): TarinError | null {
        if (typeof data != "number") {
            return { message: `Expected a number, but found ${typeof data}` };
        }

        if (this._gt && data <= this._gt) {
            return { message: `Expected a number greater than ${this._gt}.` };
        }

        if (this._gte && data < this._gte) {
            return { message: `Expected a number greater than or equal to ${this._gte}.` };
        }

        if (this._lt && data >= this._lt) {
            return { message: `Expected a number less than ${this._lt}.` };
        }

        if (this._lte && data > this._lte) {
            return { message: `Expected a number less than or equal to ${this._lte}.` };
        }

        if (this._integer && Math.floor(data) !== data) {
            return { message: `Expected an integer.` };
        }

        if (this._positive && data <= 0) {
            return { message: `Expected a positive number.` };
        }

        if (this._nonnegative && data < 0) {
            return { message: `Expected a non-negative number (greater than or equal to 0).` };
        }

        if (this._negative && data >= 0) {
            return { message: `Expected a negative number.` };
        }

        if (this._nonpositive && data > 0) {
            return { message: `Expected a non-positive number (less than or equal to 0).` };
        }

        if (this._multipleOf && (data % this._multipleOf) !== 0) {
            return { message: `Expected a number that is a multiple of ${this._multipleOf}.` };
        }

        return null;

    }

    parse(data: any): Result<TarinError, number> {
        if (!data) {
            return Result.failure<TarinError, number>({ message: "data is missing" })
        }

        return Result.success<TarinError, number>(Number(data));
    }

    gt(value: number) { this._gt = value; return this; }
    gte(value: number) { this._gte = value; return this; }
    lt(value: number) { this._lt = value; return this; }
    lte(value: number) { this._lte = value; return this; }
    integer() { this._integer = true; return this; }
    positive() { this._positive = true; return this; }
    nonnegative() { this._nonnegative = true; return this; }
    negative() { this._negative = true; return this; }
    nonpositive() { this._nonpositive = true; return this; }
    multipleOf(value: number) { this._multipleOf = value; return this; }
}

export class TarinBoolean extends TarinType<boolean, TarinBooleanDef, TarinError> {
    type: TarinDataType = "boolean";

    static create(): TarinBoolean {
        return new TarinBoolean({});
    }

    resolveType(): TarinSchemaShape {
        return "boolean";
    }

    toOpenApiSchema(): SchemaObject {
        const schema = new SchemaObject("boolean");
        if (!this.required) {
            schema.optional();
        }

        return schema;
    }

    validate(data: any): TarinError | null {
        if (typeof data == "boolean") {
            return null;
        }

        return { message: `Expected a boolean, but found ${typeof data}` };
    }

    parse(data: any): Result<TarinError, boolean> {
        if (!data) {
            return Result.failure<TarinError, boolean>({ message: "data is missing" })
        }

        return Result.success<TarinError, boolean>(Boolean(data));
    }
}

export type AnyTarinArray = TarinArray<AnyTarinObject>;
export class TarinArray<T extends AnyTarinType> extends TarinType<TypeOf<T>[], TarinArrayDef<T>, TarinTypeError[]> {
    type: TarinDataType = "array";

    static create<T extends AnyTarinType>(shape: T): TarinArray<T> {
        return new TarinArray<T>({ shape });
    }

    resolveType(): TarinSchemaShape {
        return this._def.shape.resolveType();
    }

    toOpenApiSchema(): SchemaObject {
        const schema = new SchemaObject("array");
        if (!this.required) {
            schema.optional();
        }

        schema.setArrayItemsSchema(this._def.shape.toOpenApiSchema());
        return schema;
    }

    validate(data: any): TarinTypeError[] | null {
        if (!Array.isArray(data)) {
            return [{ message: `Expected a array, but found ${typeof data}` }];
        }

        const errors = [];
        for (let item of data) {
            const itemsErrors = this._def.shape.validate(item);
            if (itemsErrors) {
                errors.push(itemsErrors);
            }
        }

        if (errors.length == 0) {
            return null;
        }

        return errors;
    }

    parse(data: any): Result<TarinTypeError[], TypeOf<T>[]> {
        if (!data) {
            return Result.failure<TarinTypeError[], TypeOf<T>[]>([{ message: "data is missing" }])
        }

        if (!Array.isArray(data)) {
            return Result.failure<TarinTypeError[], TypeOf<T>[]>([{ message: `Expected array found ${typeof data}` }]);
        }

        const errors: TarinTypeError[] = [];
        for (let item of data) {
            const parsedItem = this._def.shape.parse(item);
            if (parsedItem.isFailure()) {
                errors.push(parsedItem.error!);
            }
        }

        if (errors.length > 0) {
            return Result.failure<TarinTypeError[], TypeOf<T>[]>(errors);
        }

        return Result.success<TarinTypeError[], TypeOf<T>[]>(data as TypeOf<T>[]);
    }
}

export type AnyTarinObject = TarinObject<TarinTypeMap>
export type LiteralTarinObject = TarinObject<TarinLiteralTypeMap>

export type GenericTarinObject<T extends AnyTarinType> = TarinObject<GenericTarinTypeMap<T> | {}>

export class TarinObject<T extends TarinTypeMap> extends TarinType<TypeOfObject<T>, TarinObjectDef<T>, TarinObjectError> {
    type: TarinDataType = "object";

    static create<T extends TarinTypeMap>(shape: T): TarinObject<T> {
        return new TarinObject<T>({ shape });
    }

    resolveType(): TarinSchemaObjectShape {
        return Object.fromEntries(
            Object.entries(this._def.shape).map(([key, value]) => [key, value.resolveType()])
        );
    }

    toOpenApiSchema(): SchemaObject {
        const schema = new SchemaObject("object");
        if (!this.required) {
            schema.optional();
        }

        const paramsNames = Object.getOwnPropertyNames(this._def.shape);
        for (let param of paramsNames) {
            schema.addPropertie(param, this._def.shape[param].toOpenApiSchema());
        }
        return schema;
    }

    validate(data: any): TarinObjectError | null {
        const errors: TarinObjectError = {};
        const porpertyNames = Object.getOwnPropertyNames(this._def.shape);
        for (let porpertyName of porpertyNames) {
            const proeprtyErrors = this._def.shape[porpertyName].validate(data[porpertyName]);
            if (proeprtyErrors) {
                errors[porpertyName] = proeprtyErrors;
            }
        }

        if (Object.getOwnPropertyNames(errors).length == 0) {
            return null;
        }

        return errors;
    }

    parse(data: any): Result<TarinObjectError, TypeOfObject<T>> {
        const errors: TarinObjectError = {};
        const result: Record<string, any> = {};
        const porpertyNames = Object.getOwnPropertyNames(this._def.shape);
        for (let porpertyName of porpertyNames) {
            const itemResult = this._def.shape[porpertyName].parse(data[porpertyName]);
            if (itemResult.isFailure()) {
                errors[porpertyName] = itemResult.error!;
            }

            result[porpertyName] = itemResult.value;
        }

        if (Object.getOwnPropertyNames(errors).length > 0) {
            return Result.failure<TarinObjectError, TypeOfObject<T>>(errors);
        }

        return Result.success<TarinObjectError, TypeOfObject<T>>(result as TypeOfObject<T>);
    }
}


export type File = { buffer: Buffer; size: number; mimetype: string; filename: string; path?: string; }
export class TarinFile extends TarinType<File, TarinFileDef, TarinError> {
    type: TarinDataType = "file";

    static create(def: TarinFileDef): TarinFile {
        return new TarinFile(def);
    }

    resolveType(): TarinSchemaShape {
        return "file";
    }

    toOpenApiSchema(): SchemaObject {
        const schema = new SchemaObject("string", "binary");
        if (!this.required) {
            schema.optional();
        }

        return schema;
    }

    validate(file?: File): TarinError | null {
        if (!file) {
            return { message: "the file is missing" };
        }

        if (this._def.maxSize && file.size > this._def.maxSize) {
            return { message: `the file exceeds the maximum size of ${this._def.maxSize} bytes` };
        }

        return null;
    }

    parse(_: any): Result<TarinError, File> {
        throw new Error("Parsing is not supported for the TarinFile type");
    }
}

const string = TarinString.create;
const number = TarinNumber.create;
const boolean = TarinBoolean.create;
const array = TarinArray.create;
const object = TarinObject.create;
const file = TarinFile.create;

export type { TypeOf as infer };
export {
    string,
    number,
    boolean,
    array,
    object,
    file,
};
