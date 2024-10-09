import { zodResolver } from "@hookform/resolvers/zod"
import { ActionFunctionArgs } from "@remix-run/node"
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
import { validateSchema } from "~/utils/validate-schema.server"

import { FluidContainer, SubmitButton } from "../components"
import { HandleSignIn } from "../services"
import { isEmpty } from "../utils"

const FormSchema = z.object({
  email: z
    .string({ required_error: "Please provide an email address." })
    .email({ message: "The email address format is invalid." }),
})

type FormType = typeof FormSchema.shape

export async function action({ request }: ActionFunctionArgs) {
  const result = validateSchema<FormType>({ body: await request.json(), schema: FormSchema })
  if (!result.ok) return result.response

  return await HandleSignIn({ request, userEmail: result.data.email })
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
