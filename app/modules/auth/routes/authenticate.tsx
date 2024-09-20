import { zodResolver } from "@hookform/resolvers/zod"
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, Link, redirect, useFetcher } from "@remix-run/react"
import clsx from "clsx"
import { eq } from "drizzle-orm"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "~/components/ui/input-otp"
import { db } from "~/db"
import { authSession } from "~/db/schema"

import { FluidContainer } from "../components/fluid-container"
import { SubmitButton } from "../components/submit-button"
import { deleteAuthSession, getAuthSessionId } from "../utils/auth-session.server"
import { hasErrors } from "../utils/has-errors"
import { compare } from "../utils/hash.server"

const MAX_ATTEMPTS = 3

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionId = await getAuthSessionId(request)
  if (!sessionId) return await deleteAuthSession({ redirectTo: "/", request })

  return null
}

export async function action({ request }: ActionFunctionArgs) {
  const sessionId = await getAuthSessionId(request)
  if (!sessionId) return redirect("/")

  const bodyResult = FormSchema.safeParse(await request.json())
  if (bodyResult.error) {
    return json({ message: "Invalid OTP. Please check your input and try again." }, { status: 400 })
  }

  const otp = bodyResult.data.pin

  const session = await db.select().from(authSession).where(eq(authSession.id, sessionId))
  if (!session.length) {
    return json({ message: "Invalid OTP. Please check your input and try again." }, { status: 400 })
  }

  if (session[0].attempts >= MAX_ATTEMPTS) {
    return json(
      { message: "Maximum attempts reached. Please request a new password." },
      { status: 400 },
    )
  }

  if (new Date(session[0].expiresAt).getTime() < Date.now()) {
    return json(
      { message: "Your password has expired. Please request a new one." },
      { status: 400 },
    )
  }

  if (!(await compare(otp, session[0].otpHash))) {
    await db.update(authSession).set({ attempts: session[0].attempts + 1 })
    return json({ message: "Invalid OTP. Please check your input and try again." }, { status: 400 })
  }

  return null
}

export default function Authenticate() {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      pin: "",
    },
    resolver: zodResolver(FormSchema),
  })

  const fetcher = useFetcher()

  const serverError = fetcher.data as { message: string } | undefined
  const formValue = fetcher.json as { pin: string } | undefined

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
    <Card
      className={clsx(
        "mx-auto max-w-sm",
        hasErrors(form.formState.errors) && "animate-shake-horizontal",
      )}
    >
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
