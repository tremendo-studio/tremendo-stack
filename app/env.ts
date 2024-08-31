import { ZodError, z } from "zod"
import { config } from "dotenv"

config()

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  DB_URL: z.string(),
  DB_TOKEN: z.string(),
})

export type EnvSchema = z.infer<typeof EnvSchema>

try {
  EnvSchema.parse(process.env)
} catch (error) {
  if (error instanceof ZodError) {
    let message = "Missing required values in .env:\n"
    error.issues.forEach((issue) => {
      message += issue.path[0] + "\n"
    })
    const e = new Error(message)
    e.stack = ""
    throw e
  } else {
    console.error(error)
  }
}

export default EnvSchema.parse(process.env)
