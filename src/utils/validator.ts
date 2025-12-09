import { ZodType } from "zod";
import {
  FastifyRouteSchemaDef,
  FastifySchema,
  FastifySchemaCompiler,
} from "fastify/types/schema";
import { BadRequestException } from "../exception/badrequest.exception";
import { fmt } from "../config";
export interface IValidator {
  body?: ZodType;
  params?: ZodType;
  queryString?: ZodType;
}
export const validator = (
  validators: IValidator
): FastifySchemaCompiler<FastifySchema> => {
  return ({ httpPart }: FastifyRouteSchemaDef<FastifySchema>) => {
    return (data: unknown) => {
      if (httpPart === "params" && validators.params)
        return check(validators.params, data);
      if (httpPart === "body" && validators.body)
        return check(validators.body, data);
      if (httpPart === "querystring" && validators.queryString)
        return check(validators.queryString, data);
      return { value: data };
    };
  };
};
function check(schema: ZodType, data: unknown) {
  const result = schema.safeParse(data);

  if (result.success) return { value: result.data };

  else {
    let description = "";
    let message = JSON.parse(
      result.error.message.replace(/\\n/g, "").replace(/\\/g, "")
    )[0].message;

    let errorField = Object.keys(result.error?.formErrors?.fieldErrors || {});

    description = errorField.map(e => {
      let detail: any = result.error?.formErrors?.fieldErrors[e];
      if (detail?.length) {
        return `(${e})` + ": " + detail[0].toLowerCase()
      }
    }).join(", ")

    if (description) {
      message = description
    }

    return {
      error: new BadRequestException(
        fmt.formatError({
          status: 400,
          code: "E400",
          message,
          data: result.error.flatten()
        })
      ),
    };
  }
}
