import { zodResolver } from "@hookform/resolvers/zod"
import { ActionFunctionArgs } from "@remix-run/node"
import { Link, useActionData, useFetcher } from "@remix-run/react"
import clsx from "clsx"
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
import { validateSchema } from "~/utils/validate-schema.server"

import { FluidContainer, SubmitButton } from "../components"
import { SignUp } from "../services"
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

type FormType = typeof FormSchema.shape

export async function action({ request }: ActionFunctionArgs) {
  const result = validateSchema<FormType>({ body: await request.json(), schema: FormSchema })
  if (!result.ok) return result.error

  return await SignUp({ request, userData: result.data })
}

export default function SignUpRoute() {
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
