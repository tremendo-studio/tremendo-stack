import { zodResolver } from "@hookform/resolvers/zod"
import { ActionFunctionArgs, redirect } from "@remix-run/node"
import { json, Link, useFetcher } from "@remix-run/react"
import clsx from "clsx"
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
import { Email, OtpTemplate } from "~/modules/email"
import { castToResponse } from "~/utils/error.server"

import { FluidContainer, SubmitButton } from "../components"
import { createOTP, createSession, hashOTP } from "../services"
import { isEmpty } from "../utils"

const FormSchema = z.object({
  email: z
    .string({ required_error: "Please provide an email address." })
    .email({ message: "The email address format is invalid." }),
})

export async function action({ request }: ActionFunctionArgs) {
  const bodyResult = FormSchema.safeParse(await request.json())
  if (bodyResult.error) {
    return json(
      { message: "Invalid form data. Please check your input and try again." },
      { status: 400 },
    )
  }

  const userData = bodyResult.data
  const otp = createOTP()
  const email = new Email({ subject: "OTP", template: OtpTemplate({ otp }) })

  try {
    const { cookie } = await createSession({
      email: userData.email,
      otpHash: await hashOTP(otp),
      request,
    })
    await email.send(userData.email)
    return redirect("/auth", {
      headers: {
        "Set-Cookie": cookie,
      },
    })
  } catch (error) {
    return castToResponse(error)
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

  const errors = !isEmpty(form.formState.errors)

  function onSubmit(data: z.infer<typeof FormSchema>) {
    fetcher.submit(data, { encType: "application/json", method: "post" })
  }

  return (
    <Card className={clsx("mx-auto max-w-sm", errors && "animate-shake-horizontal")}>
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
