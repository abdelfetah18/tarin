import { HTTPMethod } from "../Endpoint";

export interface InfoObject {
    title: string;
    summary?: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
}

export interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
}

export interface LicenseObject {
    name?: string;
    identifier?: string;
    email?: string;
}

export abstract class OpenAPIObject {
    abstract toJSON(): any;
}

export default class OpenAPI extends OpenAPIObject {
    private openAPIVersion: string;
    private info: InfoObject;
    private paths?: PathsObject;
    // components?: ComponentsObject | undefined;

    constructor(openAPIVersion: string, info: InfoObject) {
        super();
        this.openAPIVersion = openAPIVersion;
        this.info = info;
    }

    setPaths(paths: PathsObject): void { this.paths = paths; }

    toJSON(): any {
        let paths;

        if (this.paths) {
            paths = this.paths.toJSON();
        }

        return {
            openapi: this.openAPIVersion,
            info: this.info,
            paths,
            // components: this.components,
        };
    }
};

export class PathsObject extends OpenAPIObject {
    pathItems: Map<string, PathItemObject> = new Map();

    addPathItem(path: string, method: HTTPMethod, operation: OperationObject): void {
        let pathItem = this.pathItems.get(path);
        if (!pathItem) {
            pathItem = new PathItemObject();
        }

        switch (method) {
            case "GET": {
                pathItem.setGET(operation);
                break;
            }
            case "POST": {
                pathItem.setPOST(operation);
                break;
            }
            case "DELETE": {
                pathItem.setDELETE(operation);
                break;
            }
            case "PATCH": {
                pathItem.setPATCH(operation);
                break;
            }
            case "HEAD": {
                pathItem.setHEAD(operation);
                break;
            }
            case "OPTIONS": {
                pathItem.setOPTIONS(operation);
                break;
            }
            case "PUT": {
                pathItem.setPUT(operation);
                break;
            }
            case "TRACE": {
                pathItem.setTRACE(operation);
                break;
            }
        }

        this.pathItems.set(path, pathItem);
    }

    toJSON(): any {
        return Object.fromEntries(
            Array.from(
                this.pathItems,
                ([path, pathItem]) => [path, pathItem.toJSON()]
            )
        );
    }
}

export class PathItemObject extends OpenAPIObject {
    private $ref?: string;
    private summary?: string;
    private description?: string;
    private parameters?: ParameterObject[];
    private get?: OperationObject;
    private post?: OperationObject;
    private put?: OperationObject;
    private patch?: OperationObject;
    private delete?: OperationObject;
    private options?: OperationObject;
    private head?: OperationObject;
    private trace?: OperationObject;

    setGET(operation: OperationObject): void { this.get = operation; }
    setPOST(operation: OperationObject): void { this.post = operation; }
    setPUT(operation: OperationObject): void { this.put = operation; }
    setDELETE(operation: OperationObject): void { this.delete = operation; }
    setHEAD(operation: OperationObject): void { this.head = operation; }
    setPATCH(operation: OperationObject): void { this.patch = operation; }
    setOPTIONS(operation: OperationObject): void { this.options = operation; }
    setTRACE(operation: OperationObject): void { this.trace = operation; }

    toJSON(): any {
        return {
            $ref: this.$ref,
            description: this.description,
            summary: this.summary,
            parameters: this.parameters,
            get: this.get?.toJSON(),
            post: this.post?.toJSON(),
            put: this.put?.toJSON(),
            patch: this.patch?.toJSON(),
            delete: this.delete?.toJSON(),
            options: this.options?.toJSON(),
            head: this.head?.toJSON(),
            trace: this.trace?.toJSON(),
        };
    }
}

export class OperationObject extends OpenAPIObject {
    private tags?: string[];
    private summary?: string;
    private description?: string;
    private operationId?: string;
    private parameters: ParameterObject[] = [];
    private requestBody?: RequestBodyObject;
    private responses?: ResponsesObject;

    addParameter(parameter: ParameterObject) {
        this.parameters.push(parameter);
    }

    setRequestBody(requestBody: RequestBodyObject): void {
        this.requestBody = requestBody;
    }

    setResponses(responses: ResponsesObject): void {
        this.responses = responses;
    }

    toJSON(): any {
        return {
            tags: this.tags,
            summary: this.summary,
            description: this.description,
            operationId: this.operationId,
            parameters: this.parameters.map(p => p.toJSON()),
            requestBody: this.requestBody?.toJSON(),
            responses: this.responses?.toJSON(),
        };
    }

}

export type ParameterType = "query" | "header" | "path" | "cookie";
export class ParameterObject extends OpenAPIObject {
    private in: ParameterType;
    private name: string;
    private description?: string;
    private required: boolean = true;

    constructor(name: string, _in: ParameterType) {
        super();
        this.in = _in;
        this.name = name;
    }

    optional(): void {
        this.required = false;
    }

    toJSON(): any {
        return {
            in: this.in,
            name: this.name,
            description: this.description,
            required: this.required,
        };
    }
}

export type ContentType = { [key in string]: MediaTypeObject; }
export class RequestBodyObject extends OpenAPIObject {
    private description?: string;
    private content: ContentObject;

    constructor(content: ContentObject) {
        super();
        this.content = content;
    }

    toJSON(): any {
        return {
            description: this.description,
            content: this.content.toJSON(),
        };
    }
}

export type SupportedMediaType = "application/json" | "multipart/form-data" | "multipart/mixed";
export class ContentObject extends OpenAPIObject {
    private mediaTypes: Map<string, MediaTypeObject> = new Map();

    addMediaType(mediaTypeName: SupportedMediaType, mediaType: MediaTypeObject): void {
        this.mediaTypes.set(mediaTypeName, mediaType);
    }

    toJSON(): any {
        const jsonObject: Record<string, any> = {};
        this.mediaTypes.forEach((mediaType, mediaTypeName) => {
            jsonObject[mediaTypeName] = mediaType.toJSON();
        });
        return jsonObject;
    }
}

export class MediaTypeObject extends OpenAPIObject {
    private schema?: SchemaObject;

    constructor(schema: SchemaObject) {
        super();
        this.schema = schema;
    }

    toJSON(): any {
        let schema;

        if (this.schema) {
            schema = this.schema.toJSON();
        }

        return {
            schema
        };
    }
}

export type SupportedSchemaType = "string" | "object" | "array" | "number" | "boolean";
export type SupportedSchemaFormat = "binary";
export class SchemaObject extends OpenAPIObject {
    private type: SupportedSchemaType;
    private properties: Map<string, SchemaObject> = new Map();
    private items?: SchemaObject;
    private format?: SupportedSchemaFormat;
    private required: boolean = true;

    constructor(type: SupportedSchemaType, format?: SupportedSchemaFormat) {
        super();
        this.type = type;
        this.format = format;
    }

    optional(): void {
        this.required = false;
    }

    addPropertie(name: string, schema: SchemaObject) {
        if (this.type == "object") {
            this.properties.set(name, schema);
        }
    }

    setArrayItemsSchema(schema: SchemaObject) {
        this.items = schema;
    }

    concat(schema: SchemaObject) {
        schema.properties.forEach((property, name) => {
            this.addPropertie(name, property);
        });
    }

    toJSON(): any {
        const jsonObject: Record<string, any> = {};
        this.properties.forEach((property, propertyName) => {
            jsonObject[propertyName] = property.toJSON();
        });

        return {
            type: this.type,
            properties: Object.getOwnPropertyNames(jsonObject).length > 0 ? jsonObject : undefined,
            items: this.items?.toJSON(),
            format: this.format,
            required: this.required,
        }
    }
}

export class ResponsesObject extends OpenAPIObject {
    private default: ResponseObject;

    constructor(_default: ResponseObject) {
        super();
        this.default = _default;
    }

    toJSON(): any {
        return {
            default: this.default.toJSON()
        }
    }
}

export class ResponseObject extends OpenAPIObject {
    private description?: string;
    private content: ContentObject = new ContentObject();
    headers: Map<string, HeaderObject> = new Map();

    constructor(content: ContentObject) {
        super();
        this.content = content;
    }

    addHeader(name: string, header: HeaderObject): void {
        this.headers.set(name, header);
    }

    toJSON(): any {
        const jsonObject: Record<string, any> = {};
        this.headers.forEach((header, headerName) => {
            jsonObject[headerName] = header.toJSON();
        });

        return {
            description: this.description,
            content: this.content.toJSON(),
            headers: Object.getOwnPropertyNames(jsonObject).length > 0 ? jsonObject : undefined,
        }
    }
}

export class HeaderObject extends OpenAPIObject {
    private required: boolean = true;

    optional(): void {
        this.required = false;
    }

    toJSON(): any {
        return {
            required: this.required,
        };
    }
}