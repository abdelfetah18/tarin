import { Input, InputSchemas } from "./Endpoint";
import Result from "./Result";
import { TarinError, TarinObjectError, TarinTypeError } from "./SchemaValidator";

export enum InputHandlerErrorType {
    Body,
    Query,
    Params,
    Headers,
    Files
}

export class InputHandlerError {
    constructor(public error: TarinTypeError, public type: InputHandlerErrorType) { }

    static body(error: TarinTypeError) { return new InputHandlerError(error, InputHandlerErrorType.Body); }
    static query(error: TarinObjectError) { return new InputHandlerError(error, InputHandlerErrorType.Query); }
    static params(error: TarinObjectError) { return new InputHandlerError(error, InputHandlerErrorType.Params); }
    static headers(error: TarinObjectError) { return new InputHandlerError(error, InputHandlerErrorType.Headers); }
    static files(error: TarinObjectError) { return new InputHandlerError(error, InputHandlerErrorType.Files); }
}

export default class InputHandler<Body, Query, Params, Headers, Files> {
    constructor(
        public body: Body,
        public query: Query,
        public params: Params,
        public headers: Headers,
        public files: Files,
    ) { }

    validate(schemas: InputSchemas): Result<InputHandlerError, Input<Body, Query, Params, Headers, Files>> {
        const bodyValidationResult = schemas.body?.validate(this.body);
        if (bodyValidationResult != null) {
            return Result.failure(InputHandlerError.body(bodyValidationResult));
        }

        const queryValidationResult = schemas.query?.validate(this.query);
        if (queryValidationResult != null) {
            return Result.failure(InputHandlerError.query(queryValidationResult));
        }

        const paramsValidationResult = schemas.params?.validate(this.params);
        if (paramsValidationResult != null) {
            return Result.failure(InputHandlerError.params(paramsValidationResult));
        }

        const headersValidationResult = schemas.headers?.validate(this.headers);
        if (headersValidationResult != null) {
            return Result.failure(InputHandlerError.headers(headersValidationResult));
        }

        const filesValidationResult = schemas.files?.validate(this.files);
        if (filesValidationResult != null) {
            return Result.failure(InputHandlerError.files(filesValidationResult));
        }

        return Result.success({
            body: this.body,
            query: this.query,
            params: this.params,
            headers: this.headers,
            files: this.files
        });
    }

    parse(schemas: InputSchemas): Result<InputHandlerError, Input<Body, Query, Params, Headers, Files>> {
        const bodyParsingResult = schemas.body?.parse(this.body);
        if (bodyParsingResult?.isFailure()) {
            return Result.failure(InputHandlerError.body(bodyParsingResult.error!));
        }

        const queryParsingResult = schemas.query?.parse(this.query);
        if (queryParsingResult?.isFailure()) {
            return Result.failure(InputHandlerError.query(queryParsingResult.error!));
        }

        const paramsParsingResult = schemas.params?.parse(this.params);
        if (paramsParsingResult?.isFailure()) {
            return Result.failure(InputHandlerError.params(paramsParsingResult.error!));
        }

        const headersParsingResult = schemas.headers?.parse(this.headers);
        if (headersParsingResult?.isFailure()) {
            return Result.failure(InputHandlerError.headers(headersParsingResult.error!));
        }

        // NOTE: Parsing files is not supported
        // const filesParsingResult = schemas.files?.parse(this.files);
        // if (filesParsingResult?.isFailure()) {
        //     return Result.failure(InputHandlerError.files(filesParsingResult.error!));
        // }

        return Result.success({
            body: this.body,
            query: this.query,
            params: this.params,
            headers: this.headers,
            files: this.files
        });
    }
}