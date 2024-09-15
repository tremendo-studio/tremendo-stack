import { zodResolver } from "@hookform/resolvers/zod"
import { ActionFunctionArgs } from "@remix-run/node"
import { json, Link, useActionData, useSubmit } from "@remix-run/react"
import { eq } from "drizzle-orm"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "~/components/ui/button"
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
import { authSessions, users } from "~/db/schema"

import { createAuthSession } from "../utils/auth-session.server"

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
  let data

  try {
    const body = await request.json()
    data = FormSchema.parse(body)
  } catch (error) {
    return json(
      { message: "Invalid form data. Please check your input and try again." },
      { status: 400 },
    )
  }

  const usersResult = await db.select().from(users).where(eq(users.email, data.email))
  if (usersResult.length)
    return json(
      {
        message: `An account with the email address ${data.email} is already registered. Please try logging in or use a different email address to create a new account.`,
        ok: false,
      },
      { status: 400 },
    )

  try {
    const authSession = await db.transaction(async (tx) => {
      await tx.insert(users).values(data)
      return await tx.insert(authSessions).values({ userEmail: data.email }).returning()
    })

    return await createAuthSession({
      redirectTo: "/authenticate",
      remember: 60 * 15,
      request,
      sessionId: authSession[0].id,
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

export default function SignUp() {
  const actionData = useActionData<typeof action>()

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(FormSchema),
  })

  const submit = useSubmit()

  function onSubmit(data: z.infer<typeof FormSchema>) {
    submit(data, { encType: "application/json", method: "post" })
  }

  useEffect(() => {
    if (actionData?.message) {
      toast.error(actionData.message, {
        duration: Infinity,
      })
    }
  }, [actionData?.message])

  return (
    <Card className="mx-auto max-w-sm">
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
                      <FormMessage />
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
                      <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                Create an account
              </Button>
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
