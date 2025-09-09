import * as SchemaValidator from "../SchemaValidator";

export type GetType<Type> = Type extends SchemaValidator.AnyTarinObject ? SchemaValidator.infer<Type> : undefined;
export type OnlyRequired<T> = { [K in keyof T as undefined extends T[K] ? never : K]: T[K]; };
export type Simplify<T> = T extends object ? { [K in keyof T]: T[K] } : T;
export type IsExactType<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
export type ExcludeTarinTypeIfExact<T> = ExcludeIfExact<T, { [K in string]: SchemaValidator.TarinSupportedType }>;
export type ExcludeTarinLiteralTypeIfExact<T> = ExcludeIfExact<T, { [K in string]: SchemaValidator.TarinSupportedLiteralType }>;
export type ExcludeIfExact<T, U> = IsExactType<T, U> extends true ? undefined : T;
