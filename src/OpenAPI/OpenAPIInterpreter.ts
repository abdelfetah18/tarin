import { SchemaValidator } from "..";
import { AnyEndpoint, OutputSchemas, InputSchemas } from "../Endpoint";
import OpenAPI, {
    ContentObject,
    HeaderObject,
    MediaTypeObject,
    OperationObject,
    ParameterObject,
    PathsObject,
    RequestBodyObject,
    ResponseObject,
    ResponsesObject,
    SchemaObject
} from "./index";

export default class OpenAPIInterpreter {
    generateDocs(endpoints: AnyEndpoint[]): Record<string, any> {
        const openAPI = new OpenAPI("3.1.0", { title: "API Documentation", version: "1.0.0" });
        const paths = new PathsObject();

        for (const endpoint of endpoints) {
            const path = this.processPath(endpoint);
            const operation = this.buildOperation(endpoint);

            if (operation) {
                paths.addPathItem(path, endpoint.method, operation);
            }
        }

        openAPI.setPaths(paths);
        return openAPI.toJSON();
    }

    private processPath(endpoint: AnyEndpoint): string {
        let path = endpoint.path;

        if (endpoint.inputType && endpoint.inputType.params) {
            const paramsNames = Object.getOwnPropertyNames(endpoint.inputType.params.resolveType());
            for (const param of paramsNames) {
                path = path.replace(`:${param}`, `{${param}}`);
            }
        }

        return path;
    }

    private buildOperation(endpoint: AnyEndpoint): OperationObject | null {
        const operation = new OperationObject();

        if (endpoint.inputType) {
            this.addParameters(endpoint.inputType, operation);
            this.addRequestBody(endpoint.inputType, operation);
        }

        if (endpoint.outputType) {
            this.addResponses(endpoint.outputType, operation, endpoint.errorType);
        }

        return operation;
    }

    private addParameters(inputType: InputSchemas, operation: OperationObject): void {
        if (inputType.query) {
            this.addQueryParameters(inputType.query, operation);
        }

        if (inputType.params) {
            this.addPathParameters(inputType.params, operation);
        }

        if (inputType.headers) {
            this.addHeaderParameters(inputType.headers, operation);
        }
    }

    private addQueryParameters(queryType: SchemaValidator.AnyTarinObject, operation: OperationObject): void {
        const queryParams = Object.getOwnPropertyNames(queryType.resolveType());
        for (const param of queryParams) {
            let parameter = new ParameterObject(param, "query");
            if (!queryType._def.shape[param].required) {
                parameter.optional();
            }
            operation.addParameter(parameter);
        }
    }

    private addPathParameters(paramsType: SchemaValidator.AnyTarinObject, operation: OperationObject): void {
        const pathParams = Object.getOwnPropertyNames(paramsType.resolveType());
        for (const param of pathParams) {
            let path = new ParameterObject(param, "path");
            if (!paramsType._def.shape[param].required) {
                path.optional();
            }
            operation.addParameter(path);
        }
    }

    private addHeaderParameters(headersType: SchemaValidator.AnyTarinObject, operation: OperationObject): void {
        const headersParams = Object.getOwnPropertyNames(headersType.resolveType());
        for (const header of headersParams) {
            let headerParam = new ParameterObject(header, "header");
            if (!headersType._def.shape[header].required) {
                headerParam.optional();
            }
            operation.addParameter(headerParam);
        }
    }

    private addRequestBody(inputType: InputSchemas, operation: OperationObject): void {
        let hasFiles = inputType.files != undefined;
        let hasBody = inputType.body != undefined;

        let schema = hasFiles ? new SchemaObject("object") : undefined;

        if (hasFiles) {
            schema!.concat(inputType.files!.toOpenApiSchema());
            if (hasBody) {
                schema!.addPropertie("data", inputType.body!.toOpenApiSchema());
            }
        } else {
            if (hasBody) {
                schema = inputType.body!.toOpenApiSchema();
            }
        }

        if (schema) {
            const mediaType = new MediaTypeObject(schema);
            const content = new ContentObject();
            content.addMediaType(inputType.files ? "multipart/form-data" : "application/json", mediaType);
            const requestBody = new RequestBodyObject(content);
            operation.setRequestBody(requestBody);
        }
    }

    private addResponses(outputType: OutputSchemas, operation: OperationObject, errorType?: SchemaValidator.AnyTarinObject): void {
        let hasFiles = outputType.files != undefined;
        let hasBody = outputType.body != undefined;

        let schema = hasFiles ? new SchemaObject("object") : undefined;

        if (hasFiles) {
            schema!.concat(outputType.files!.toOpenApiSchema());
            if (hasBody) {
                schema!.addPropertie("data", outputType.body!.toOpenApiSchema());
            }
        } else {
            if (hasBody) {
                schema = outputType.body!.toOpenApiSchema();
            }
        }

        if (schema) {
            const mediaType = new MediaTypeObject(schema);
            const content = new ContentObject();
            // NOTE: Please note that the OpenAPI specification does not support multipart responses, so they will be displayed as text.
            content.addMediaType(outputType.files ? "multipart/form-data" : "application/json", mediaType);

            const response = new ResponseObject(content);
            if (outputType.headers) {
                const headersParams = Object.getOwnPropertyNames(outputType.headers.resolveType());
                for (const headerName of headersParams) {
                    let header = new HeaderObject();
                    if (!outputType.headers._def.shape[headerName].required) {
                        header.optional();
                    }
                    response.addHeader(headerName, header);
                }
            }

            const responses = new ResponsesObject(response);

            if (errorType) {
                const schema = errorType.toOpenApiSchema();
                const mediaType = new MediaTypeObject(schema);
                const content = new ContentObject();
                content.addMediaType("application/json", mediaType);

                const response = new ResponseObject(content);
                responses.addResponse("400", response);
            }

            operation.setResponses(responses);
        }
    }
}
