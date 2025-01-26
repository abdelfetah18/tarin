import * as SchemaValidator from "./SchemaValidator";

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH" | "OPTIONS" | "TRACE";

type GetType<Type> = Type extends SchemaValidator.AnyTarinObject ? SchemaValidator.infer<Type> : undefined;
type OnlyRequired<T> = { [K in keyof T as T[K] extends undefined ? never : K]: T[K]; };
type Simplify<T> = T extends object ? { [K in keyof T]: T[K] } : T;
type IsExactType<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type MakeItBetter<T> = IsExactType<T, { [K in string]: SchemaValidator.TarinSupportedType }> extends true ? undefined : T;

type EndpointCallBack<InputType, OutputType, ErrorType> = (input: InputType, error: (error: ErrorType) => void) => OutputType;

export default class Endpoint<InputType, OutputType, ErrorType> {
    method: HTTPMethod;
    path: string;
    inputType?: Input<SchemaValidator.AnyTarinObject, SchemaValidator.AnyTarinObject, SchemaValidator.AnyTarinObject, SchemaValidator.AnyTarinObject, SchemaValidator.GenericTarinObject<SchemaValidator.TarinFile>>;
    outputType?: Output<SchemaValidator.AnyTarinObject, SchemaValidator.AnyTarinObject, SchemaValidator.GenericTarinObject<SchemaValidator.TarinFile>>;
    errorType?: SchemaValidator.AnyTarinObject;
    callback?: EndpointCallBack<InputType, OutputType, ErrorType>;

    constructor(path: string, method: HTTPMethod) {
        this.path = path;
        this.method = method;
    }

    input<
        BodyType extends SchemaValidator.AnyTarinObject,
        QueryType extends SchemaValidator.AnyTarinObject,
        ParamsType extends SchemaValidator.AnyTarinObject,
        HeadersType extends SchemaValidator.AnyTarinObject,
        FilesType extends SchemaValidator.GenericTarinObject<SchemaValidator.TarinFile>
    >(inputType: Input<BodyType, QueryType, ParamsType, HeadersType, FilesType>) {
        this.inputType = inputType;

        type ComputedInputType = Simplify<OnlyRequired<{
            body: MakeItBetter<Simplify<GetType<BodyType>>>;
            params: MakeItBetter<Simplify<GetType<ParamsType>>>;
            query: MakeItBetter<Simplify<GetType<QueryType>>>;
            headers: MakeItBetter<Simplify<GetType<HeadersType>>>;
            files: MakeItBetter<Simplify<GetType<FilesType>>>;
        }>>;

        return this as unknown as Endpoint<ComputedInputType, OutputType, ErrorType>;
    }

    output<
        BodyType extends SchemaValidator.AnyTarinObject,
        HeadersType extends SchemaValidator.AnyTarinObject,
        FilesType extends SchemaValidator.GenericTarinObject<SchemaValidator.TarinFile>
    >(outputType: Output<BodyType, HeadersType, FilesType>) {
        this.outputType = outputType;

        type ComputedOutputType = Simplify<OnlyRequired<{
            body: MakeItBetter<Simplify<GetType<BodyType>>>;
            headers: MakeItBetter<Simplify<GetType<HeadersType>>>;
            files: MakeItBetter<Simplify<GetType<FilesType>>>;
        }>>;

        return this as unknown as Endpoint<InputType, ComputedOutputType, ErrorType>;
    }

    error<Type extends SchemaValidator.AnyTarinObject>(errorType: Type) {
        this.errorType = errorType;
        type ComputedErrorType = MakeItBetter<Simplify<GetType<Type>>>;

        return this as unknown as Endpoint<InputType, OutputType, ComputedErrorType>;
    }

    handleLogic(callback: EndpointCallBack<InputType, OutputType, ErrorType>): Endpoint<InputType, OutputType, ErrorType> {
        this.callback = callback;
        return this;
    }


    static createGET(path: string): AnyEndpoint { return new Endpoint(path, "GET"); }
    static createPOST(path: string): AnyEndpoint { return new Endpoint(path, "POST"); }
    static createDELETE(path: string): AnyEndpoint { return new Endpoint(path, "DELETE"); }
    static createPATCH(path: string): AnyEndpoint { return new Endpoint(path, "PATCH"); }
    static createHEAD(path: string): AnyEndpoint { return new Endpoint(path, "HEAD"); }
    static createOPTIONS(path: string): AnyEndpoint { return new Endpoint(path, "OPTIONS"); }
    static createPUT(path: string): AnyEndpoint { return new Endpoint(path, "PUT"); }
    static createTRACE(path: string): AnyEndpoint { return new Endpoint(path, "TRACE"); }
}

export interface Input<BodyType, QueryType, ParamsType, HeadersType, FilesType> {
    body?: BodyType;
    query?: QueryType;
    params?: ParamsType;
    headers?: HeadersType;
    files?: FilesType;
};

export interface Output<BodyType, HeadersType, FilesType> {
    body?: BodyType;
    headers?: HeadersType;
    files?: FilesType;
};

export type AnyInputType = Input<SchemaValidator.AnyTarinObject, SchemaValidator.AnyTarinObject, SchemaValidator.AnyTarinObject, SchemaValidator.AnyTarinObject, SchemaValidator.AnyTarinObject>;
export type AnyOutputType = Output<SchemaValidator.AnyTarinObject, SchemaValidator.AnyTarinObject, SchemaValidator.GenericTarinObject<SchemaValidator.TarinFile>>;



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