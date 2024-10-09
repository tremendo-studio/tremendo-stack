import { json } from "@remix-run/node"
import { ZodObject, ZodRawShape } from "zod"

type ValidateSchemaArgs<T extends ZodRawShape> = {
  body: object
  schema: ZodObject<T>
}

export function validateSchema<T extends ZodRawShape>(args: ValidateSchemaArgs<T>) {
  const { body, schema } = args

  const result = schema.safeParse(body)
  if (result.error) {
    return {
      ok: result.success,
      response: json(
        {
          fieldErrors: result.error.flatten().fieldErrors,
          message: "Invalid data. Please check your input and try again.",
          ok: false,
        },
        {
          status: 400,
        },
      ),
    }
  }

  return { data: result.data, ok: result.success }
}
