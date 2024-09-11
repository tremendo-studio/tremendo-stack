import { config } from "dotenv"
import { z, ZodError } from "zod"

config()

const EnvSchema = z.object({
  DB_TOKEN: z.string(),
  DB_URL: z.string(),
  NODE_ENV: z.string().default("development"),
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
