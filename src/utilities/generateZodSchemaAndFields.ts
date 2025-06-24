import { z, ZodTypeAny, ZodObject, ZodUnion, ZodNumber, ZodString } from "zod";
import { CredentialConfig } from "../api/mcp/types";
import { FieldErrors } from "react-hook-form";

/**
 * Describes the metadata for a single form field, intended for use with React Hook Form.
 */
export interface FormFieldData {
  /** The name used for registration in React Hook Form (e.g., "APITokenConfig.api_token"). */
  name: string;
  /** A human-readable label for the form field (e.g., "API Token"). */
  label: string;
  /** The HTML input type (e.g., "text", "password", "email", "url"). */
  type: "text" | "password" | "email" | "url" | "number";
  /** Placeholder text for the input field. */
  placeholder: string;
}

/**
 * An object where keys are credential types (e.g., "APITokenConfig")
 * and values are arrays of form field metadata.
 */
export type FieldDataGroup = {
  [credentialType: string]: FormFieldData[];
};

/**
 * Maps a string identifier (e.g., 'string', 'email') to a Zod schema.
 * All fields are considered required.
 */
const mapStringToZod = (type: string): ZodTypeAny => {
  switch (type.toLowerCase()) {
    case "string":
      return z
        .string({ required_error: "This is required." })
        .trim()
        .min(1, { message: "Cannot be empty." });
    case "url":
      return z
        .string({ required_error: "URL is required." })
        .trim()
        .url({ message: "Invalid URL format." });
    case "email":
      return z
        .string({ required_error: "Email is required." })
        .trim()
        .email({ message: "Invalid email format." });

    // --- UPDATED CASES FOR NUMBER AND INTEGER WITH STRICTER PARSING ---
    case "number":
      return z.preprocess(
        (val) => {
          if (typeof val === "string" && val.trim() !== "") {
            // Regex to check if the string is a valid float (allows optional decimal part).
            const isFloat = /^-?\d+(\.\d+)?$/;
            // Only parse if the entire string is a valid number.
            if (isFloat.test(val)) {
              return parseFloat(val);
            }
          }
          // If not a parsable string, return the original value for Zod to handle.
          return val;
        },
        z.number({
          required_error: "This is required.",
          invalid_type_error: "Must be a valid number.",
        }),
      );
    case "integer":
      return z.preprocess(
        (val) => {
          if (typeof val === "string" && val.trim() !== "") {
            // Regex to check if the string is a valid integer (no decimal part).
            const isInteger = /^-?\d+$/;
            // Only parse if the entire string is a valid integer.
            if (isInteger.test(val)) {
              return parseInt(val, 10);
            }
          }
          return val;
        },
        z
          .number({
            required_error: "This is required.",
            invalid_type_error: "Must be a valid integer.",
          })
          .int({ message: "Must be a whole number without decimals." }),
      );
    // --- END OF UPDATES ---

    case "boolean":
      return z.boolean({ required_error: "This is required." });
    default:
      throw new Error(`Unsupported validation type: '${type}'`);
  }
};

/**
 * Generates a Zod schema from an array of credential configuration objects.
 */
export function generateZodSchema(
  configs: CredentialConfig[],
):
  | ZodObject<any>
  | ZodUnion<[ZodObject<any>, ZodObject<any>, ...ZodObject<any>[]]>
  | ZodObject<{}> {
  if (!configs || configs.length === 0) {
    return z.object({});
  }
  const schemas: ZodObject<any>[] = configs.map((config) => {
    const configKey = Object.keys(config)[0] as keyof CredentialConfig;
    const fields = (config as any)[configKey];
    if (!fields || typeof fields !== "object") {
      throw new Error(`Invalid configuration for ${configKey}.`);
    }
    const shape: { [key: string]: ZodTypeAny } = {};
    for (const fieldKey in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, fieldKey)) {
        const fieldTypeString = fields[fieldKey];
        shape[fieldKey] = mapStringToZod(fieldTypeString);
      }
    }
    const innerSchema = z.object(shape);
    return z.object({ [configKey]: innerSchema });
  });

  if (schemas.length === 1) {
    return schemas[0];
  } else {
    return z.union(
      schemas as [ZodObject<any>, ZodObject<any>, ...ZodObject<any>[]],
    );
  }
}

//=========== FORM FIELD DATA EXTRACTOR ===========//

function generateLabel(name: string): string {
  const result = name.replace(/([A-Z])/g, " $1").replace(/_/g, " ");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function getInputType(
  fieldName: string,
  zodType: ZodTypeAny,
): FormFieldData["type"] {
  if (fieldName.toLowerCase().includes("password")) return "password";

  // Check the inner type for preprocessed schemas
  const actualType =
    zodType._def.typeName === "ZodPreprocess" ? zodType._def.schema : zodType;

  if (actualType instanceof ZodString) {
    if (actualType.isEmail) return "email";
    if (actualType.isURL) return "url";
  }
  if (actualType instanceof ZodNumber) return "number";
  return "text";
}

export function getNestedError(
  errors: FieldErrors,
  path: string,
): string | undefined {
  const keys = path.split(".");
  let current: any = errors;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current?.message?.toString();
}

/**
 * Traverses a Zod schema and extracts metadata for generating form fields.
 */
export function getFormFieldsFromSchema(schema: ZodTypeAny): FieldDataGroup {
  const fieldGroups: FieldDataGroup = {};
  const objectSchemas: ZodObject<any>[] =
    schema._def.typeName === "ZodUnion"
      ? schema._def.options
      : [schema as ZodObject<any>];

  for (const objectSchema of objectSchemas) {
    if (objectSchema._def.typeName !== "ZodObject") continue;
    const outerKey = Object.keys(objectSchema.shape)[0];
    if (!outerKey) continue;
    const innerSchema = objectSchema.shape[outerKey];
    if (innerSchema?._def?.typeName !== "ZodObject") continue;

    const fields: FormFieldData[] = [];
    const innerShape = innerSchema.shape;

    for (const fieldKey in innerShape) {
      if (Object.prototype.hasOwnProperty.call(innerShape, fieldKey)) {
        const zodType = innerShape[fieldKey];
        const label = generateLabel(fieldKey);
        fields.push({
          name: `${outerKey}.${fieldKey}`,
          label: label,
          type: getInputType(fieldKey, zodType),
          placeholder: `Enter ${label}...`,
        });
      }
    }
    fieldGroups[outerKey] = fields;
  }
  return fieldGroups;
}
