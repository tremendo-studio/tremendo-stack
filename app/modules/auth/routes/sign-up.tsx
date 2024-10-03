import { zodResolver } from "@hookform/resolvers/zod"
import { ActionFunctionArgs, redirect } from "@remix-run/node"
import { Link, useActionData, useFetcher } from "@remix-run/react"
import clsx from "clsx"
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
import { user as userSchema } from "~/db/schema"
import { Email, OtpTemplate } from "~/modules/email"
import { mapToResponse } from "~/utils/app-error.server"

import { FluidContainer, SubmitButton } from "../components"
import { createOTP, createSession, hashOTP } from "../services"
import { isEmpty } from "../utils"

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
  try {
    const body = FormSchema.parse(await request.json())
    const otp = createOTP()
    // const email = new Email({ subject: "OTP", template: OtpTemplate({ otp }) })
    const user = await db.select().from(userSchema).where(eq(userSchema.email, body.email))
    if (!user.length) await db.insert(userSchema).values(body)
    const { cookie } = await createSession({
      email: body.email,
      otpHash: await hashOTP({ otp }),
      request,
    })
    // await email.send(userData.email)
    console.debug("OTP 🎰: ", otp)
    return redirect("/auth", {
      headers: {
        "Set-Cookie": cookie,
      },
    })
  } catch (error) {
    return mapToResponse(error)
  }
}

export default function SignUp() {
  const actionData = useActionData<typeof action>()

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(FormSchema),
    shouldUseNativeValidation: false,
  })

  const fetcher = useFetcher()
  const errors = !isEmpty(form.formState.errors)

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
    <Card className={clsx("mx-auto max-w-sm", errors && "animate-shake-horizontal")}>
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
