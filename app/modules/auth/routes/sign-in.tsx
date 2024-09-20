import { zodResolver } from "@hookform/resolvers/zod"
import { createId } from "@paralleldrive/cuid2"
import { ActionFunctionArgs } from "@remix-run/node"
import { json, Link, useFetcher } from "@remix-run/react"
import clsx from "clsx"
import crypto from "crypto"
import { eq } from "drizzle-orm"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { db } from "~/db"
import { authSession, user } from "~/db/schema"

import { FluidContainer } from "../components/fluid-container"
import { SubmitButton } from "../components/submit-button"
import { createAuthSession } from "../utils/auth-session.server"
import { hasErrors } from "../utils/has-errors"
import { hash } from "../utils/hash.server"

const FormSchema = z.object({
  email: z
    .string({ required_error: "Please provide an email address." })
    .email({ message: "The email address format is invalid." }),
})

export async function action({ request }: ActionFunctionArgs) {
  const bodyResult = FormSchema.safeParse(await request.json())
  if (bodyResult.error)
    return json(
      { message: "Invalid form data. Please check your input and try again." },
      { status: 400 },
    )

  const data = bodyResult.data

  const otp = String(crypto.randomInt(100000, 999999))
  const otpHash = await hash(otp)

  const usersResult = await db.select().from(user).where(eq(user.email, data.email))
  if (!usersResult.length) {
    return await createAuthSession({
      redirectTo: "/authenticate",
      remember: 60 * 15,
      request,
      sessionId: createId(),
    })
  }

  try {
    const session = await db
      .insert(authSession)
      .values({
        expiresAt: new Date(Date.now() * 60 * 15).toDateString(),
        otpHash: otpHash,
        userEmail: data.email,
      })
      .returning()

    return await createAuthSession({
      redirectTo: "/authenticate",
      remember: 60 * 15,
      request,
      sessionId: session[0].id,
    })
  } catch (error) {
    return json(
      {
        message:
          "An error occurred while processing your request. Please try again later or contact support if the issue persists.",
        ok: false,
      },
      { status: 500 },
    )
  }
}

export default function SignIn() {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(FormSchema),
  })

  const fetcher = useFetcher()

  function onSubmit(data: z.infer<typeof FormSchema>) {
    fetcher.submit(data, { encType: "application/json", method: "post" })
  }

  return (
    <Card
      className={clsx(
        "mx-auto max-w-sm",
        hasErrors(form.formState.errors) && "animate-shake-horizontal",
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>Enter your email to sing in</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        placeholder="m@example.com"
                        required
                        type="email"
                      />
                    </FormControl>
                    <FluidContainer>
                      <FormMessage />
                    </FluidContainer>
                  </FormItem>
                )}
              />
              <SubmitButton state={fetcher.state}>Sign in</SubmitButton>
            </div>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Need to create an account?{" "}
          <Link className="underline" to="/sign-up">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
