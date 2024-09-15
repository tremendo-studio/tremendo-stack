import { zodResolver } from "@hookform/resolvers/zod"
import { ActionFunctionArgs } from "@remix-run/node"
import { Link, redirect, useSubmit } from "@remix-run/react"
import { useForm } from "react-hook-form"
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

const FormSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
})

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json()
  console.debug(FormSchema.parse(body))

  return redirect("/authenticate")
}

export default function SignIn() {
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

  return (
    <Card className="mx-auto max-w-sm">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                Sign in
              </Button>
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
