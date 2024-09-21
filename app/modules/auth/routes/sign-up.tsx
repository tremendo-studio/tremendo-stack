import { zodResolver } from "@hookform/resolvers/zod"
import { ActionFunctionArgs } from "@remix-run/node"
import { json, Link, useActionData, useFetcher } from "@remix-run/react"
import clsx from "clsx"
import crypto from "crypto"
import { eq } from "drizzle-orm"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import { sendOTP } from "~/integrations/resend.server"

import { FluidContainer } from "../components/fluid-container"
import { SubmitButton } from "../components/submit-button"
import { createAuthSession } from "../utils/auth-session.server"
import { hasErrors } from "../utils/has-errors"
import { hash } from "../utils/hash.server"

const FormSchema = z.object({
  email: z
    .string({ required_error: "Please provide an email address." })
    .email({ message: "The email address format is invalid." }),
  firstName: z
    .string({ required_error: "Please provide your first name." })
    .min(2, { message: "First name must be at least 2 characters long." }),
  lastName: z
    .string({ required_error: "Please provide your last name." })
    .min(2, { message: "First name must be at least 2 characters long." }),
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

  console.debug(otp)

  const usersResult = await db.select().from(user).where(eq(user.email, data.email))
  if (usersResult.length) {
    try {
      const session = await db
        .insert(authSession)
        .values({
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          otpHash: otpHash,
          userEmail: data.email,
        })
        .returning()

      const email = await sendOTP(otp, data.email)
      console.debug("email", JSON.stringify(email))

      return await createAuthSession({
        redirectTo: "/authenticate",
        remember: 60 * 15,
        request,
        sessionId: session[0].id,
      })
    } catch (error) {
      console.error(error)
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

  try {
    const session = await db.transaction(async (tx) => {
      await tx.insert(user).values(data)
      return await tx
        .insert(authSession)
        .values({
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          otpHash: otpHash,
          userEmail: data.email,
        })
        .returning()
    })

    const email = await sendOTP(otp, data.email)
    console.debug("email", JSON.stringify(email))

    return await createAuthSession({
      redirectTo: "/authenticate",
      remember: 60 * 15,
      request,
      sessionId: session[0].id,
    })
  } catch (error) {
    console.debug(error)
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

export default function SignUp() {
  const actionData = useActionData<typeof action>()

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

  useEffect(() => {
    if (actionData?.message) {
      toast.error(actionData.message, {
        duration: Infinity,
      })
    }
  }, [actionData?.message])

  return (
    <Card
      className={clsx(
        "mx-auto max-w-sm",
        hasErrors(form.formState.errors) && "animate-shake-horizontal",
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>Enter your information to create an account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 items-start gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input {...field} id="first-name" placeholder="Romualdo" required />
                      </FormControl>
                      <FluidContainer>
                        <FormMessage />
                      </FluidContainer>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input {...field} id="last-name" placeholder="Robinson" required />
                      </FormControl>
                      <FluidContainer>
                        <FormMessage />
                      </FluidContainer>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} id="email" placeholder="romualdo@acme.com" required />
                    </FormControl>
                    <FluidContainer>
                      <FormMessage />
                    </FluidContainer>
                  </FormItem>
                )}
              />
              <SubmitButton state={fetcher.state}>Create an account</SubmitButton>
            </div>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link className="underline" to="/sign-in">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
