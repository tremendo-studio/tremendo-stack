import { zodResolver } from "@hookform/resolvers/zod"
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, Link, redirect, useFetcher } from "@remix-run/react"
import clsx from "clsx"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "~/components/ui/input-otp"
import { AppError, castToResponse } from "~/utils/error.server"

import { FluidContainer, SubmitButton } from "../components"
import { getSession } from "../services"
import { logIn, LogInError } from "../services/login.server"
import { isEmpty } from "../utils"

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request)
  if (!session) return redirect("/")

  return null
}

export async function action({ request }: ActionFunctionArgs) {
  const bodyResult = FormSchema.safeParse(await request.json())
  if (bodyResult.error) {
    return json(
      { message: "Invalid OTP. Please check your input and try again.", ok: false },
      { status: 400 },
    )
  }

  const data = bodyResult.data

  try {
    await logIn({ otp: data.pin, request })
    return redirect("/dashboard")
  } catch (error) {
    return castToResponse(error)
}

export default function Auth() {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      pin: "",
    },
    resolver: zodResolver(FormSchema),
  })

  const fetcher = useFetcher()

  const serverError = fetcher.data as { message: string } | undefined
  const formValue = fetcher.json as { pin: string } | undefined
  const errors = !isEmpty(form.formState.errors)

  useEffect(() => {
    if (!formValue?.pin) return
    form.reset({ pin: formValue?.pin })
  }, [form, formValue])

  useEffect(() => {
    if (!serverError?.message) return
    form.setError("pin", { message: serverError.message, type: "server" })
  }, [serverError, form])

  function onSubmit(data: z.infer<typeof FormSchema>) {
    fetcher.submit(data, { encType: "application/json", method: "post" })
  }

  return (
    <Card className={clsx("mx-auto max-w-sm", errors && "animate-shake-horizontal")}>
      <CardHeader>
        <CardTitle className="text-xl">One-Time Password</CardTitle>
        <CardDescription>Please enter the one-time password sent to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="w-full" noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <div className="grid gap-4">
                  <FormItem className="w-full">
                    <FormControl>
                      <InputOTP containerClassName="flex justify-center" maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FluidContainer>
                      <FormMessage className="text-center" />
                    </FluidContainer>
                  </FormItem>
                  <SubmitButton state={fetcher.state}>Continue</SubmitButton>
                </div>
              )}
            />
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
