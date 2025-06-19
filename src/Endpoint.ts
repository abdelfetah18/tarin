import Result from "./Result";
import * as SchemaValidator from "./SchemaValidator";

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH" | "OPTIONS" | "TRACE";

type GetType<Type> = Type extends SchemaValidator.AnyTarinObject ? SchemaValidator.infer<Type> : undefined;
type OnlyRequired<T> = { [K in keyof T as T[K] extends undefined ? never : K]: T[K]; };
type Simplify<T> = T extends object ? { [K in keyof T]: T[K] } : T;
type IsExactType<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type ExcludeTarinTypeIfExact<T> = ExcludeIfExact<T, { [K in string]: SchemaValidator.TarinSupportedType }>;
type ExcludeTarinLiteralTypeIfExact<T> = ExcludeIfExact<T, { [K in string]: SchemaValidator.TarinSupportedLiteralType }>;
type ExcludeIfExact<T, U> = IsExactType<T, U> extends true ? undefined : T;

export default class Endpoint<InputType, OutputType, ErrorType> {
    method: HTTPMethod;
    path: string;
    inputType?: InputSchemas;
    outputType?: OutputSchemas;
    errorType?: SchemaValidator.AnyTarinObject;
    callback?: (input: InputType) => Result<ErrorType, OutputType> | Promise<Result<ErrorType, OutputType>>;
    middlewares: AnyCallback[];

    constructor(path: string, method: HTTPMethod) {
        this.path = path;
        this.method = method;
        this.middlewares = [];
    }

    input<
        BodyType extends BodySchema,
        QueryType extends QuerySchema,
        ParamsType extends ParamsSchema,
        HeadersType extends HeadersSchema,
        FilesType extends FilesSchema
    >(inputType: Input<BodyType, QueryType, ParamsType, HeadersType, FilesType>) {
        this.inputType = inputType;

        type ComputedInputType = Simplify<OnlyRequired<{
            body: ExcludeTarinTypeIfExact<Simplify<GetType<BodyType>>>;
            params: ExcludeTarinLiteralTypeIfExact<Simplify<GetType<ParamsType>>>;
            query: ExcludeTarinLiteralTypeIfExact<Simplify<GetType<QueryType>>>;
            headers: ExcludeTarinLiteralTypeIfExact<Simplify<GetType<HeadersType>>>;
            files: ExcludeTarinTypeIfExact<Simplify<GetType<FilesType>>>;
        }>>;

        return this as unknown as Endpoint<ComputedInputType, OutputType, ErrorType>;
    }

    output<
        BodyType extends BodySchema,
        HeadersType extends HeadersSchema,
        FilesType extends FilesSchema
    >(outputType: Output<BodyType, HeadersType, FilesType>) {
        this.outputType = outputType;

        type ComputedOutputType = Simplify<OnlyRequired<{
            body: ExcludeTarinTypeIfExact<Simplify<GetType<BodyType>>>;
            headers: ExcludeTarinLiteralTypeIfExact<Simplify<GetType<HeadersType>>>;
            files: ExcludeTarinTypeIfExact<Simplify<GetType<FilesType>>>;
        }>>;

        return this as unknown as Endpoint<InputType, ComputedOutputType, ErrorType>;
    }

    error<Type extends SchemaValidator.AnyTarinObject>(errorType: Type) {
        this.errorType = errorType;
        type ComputedErrorType = ExcludeTarinTypeIfExact<Simplify<GetType<Type>>>;

        return this as unknown as Endpoint<InputType, OutputType, ComputedErrorType>;
    }

    handleLogic(callback: (input: InputType) => Result<ErrorType, OutputType> | Promise<Result<ErrorType, OutputType>>): Endpoint<InputType, OutputType, ErrorType> {
        this.callback = callback;
        return this;
    }

    middleware<MiddlewareOutputType extends SchemaValidator.AnyTarinType>(
        outputType: MiddlewareOutputType,
        callback: Callback<InputType, ExcludeTarinTypeIfExact<Simplify<GetType<MiddlewareOutputType>>>, ErrorType>,
    ) {
        this.middlewares.push(callback);

        type ComputedInputType = InputType & { middleware: ExcludeTarinTypeIfExact<Simplify<GetType<MiddlewareOutputType>>>; }

        return this as unknown as Endpoint<ComputedInputType, OutputType, ErrorType>;
    }

    static createGET(path: string): InitEndpoint { return new Endpoint(path, "GET"); }
    static createPOST(path: string): InitEndpoint { return new Endpoint(path, "POST"); }
    static createDELETE(path: string): InitEndpoint { return new Endpoint(path, "DELETE"); }
    static createPATCH(path: string): InitEndpoint { return new Endpoint(path, "PATCH"); }
    static createHEAD(path: string): InitEndpoint { return new Endpoint(path, "HEAD"); }
    static createOPTIONS(path: string): InitEndpoint { return new Endpoint(path, "OPTIONS"); }
    static createPUT(path: string): InitEndpoint { return new Endpoint(path, "PUT"); }
    static createTRACE(path: string): InitEndpoint { return new Endpoint(path, "TRACE"); }
}

export type Callback<Input, Output, Error> = (input: Input) => Result<Error, Output> | Promise<Result<Error, Output>>;
export type AnyCallback = Callback<any, any, any>;

export interface Input<BodyType, QueryType, ParamsType, HeadersType, FilesType> {
    body?: BodyType;
    query?: QueryType;
    params?: ParamsType;
    headers?: HeadersType;
    files?: FilesType;
};

type AnyBodyType = any | undefined;
type AnyQueryType = Record<string, string | number | boolean | undefined> | undefined;
type AnyParamsType = Record<string, string | number | boolean | undefined> | undefined;
type AnyHeadersType = Record<string, string | number | boolean | undefined> | undefined;
type AnyFilesType = Record<string, SchemaValidator.File> | undefined;
type AnyMiddlewareType = any | undefined;

export type AnyInput = Input<
    AnyBodyType,
    AnyQueryType,
    AnyParamsType,
    AnyHeadersType,
    AnyFilesType
> & { middleware?: AnyMiddlewareType; };

export interface Output<BodyType, HeadersType, FilesType> {
    body?: BodyType;
    headers?: HeadersType;
    files?: FilesType;
};

export type AnyOutput = Output<
    AnyBodyType,
    AnyHeadersType,
    AnyFilesType
>;

export type BodySchema = SchemaValidator.AnyTarinType;
export type QuerySchema = SchemaValidator.LiteralTarinObject;
export type ParamsSchema = SchemaValidator.LiteralTarinObject;
export type HeadersSchema = SchemaValidator.LiteralTarinObject;
export type FilesSchema = SchemaValidator.GenericTarinObject<SchemaValidator.TarinFile>;

export type InputSchemas = Input<BodySchema, QuerySchema, ParamsSchema, HeadersSchema, FilesSchema>;
export type OutputSchemas = Output<BodySchema, HeadersSchema, FilesSchema>;

export const endpoint = {
    get: Endpoint.createGET,
    post: Endpoint.createPOST,
    delete: Endpoint.createDELETE,
    patch: Endpoint.createPATCH,
    head: Endpoint.createHEAD,
    options: Endpoint.createOPTIONS,
    put: Endpoint.createPUT,
    trace: Endpoint.createTRACE,
};

// FIXME: Do not use any explicitly
export type AnyEndpoint = Endpoint<any, any, any>;
export type InitEndpoint = Endpoint<{}, {}, {}>;