import { ReloadIcon } from "@radix-ui/react-icons"
import { ReactNode } from "react"

import { Button } from "~/components/ui/button"

type FormButtonProps = {
  children: ReactNode
  state: string
}

export default function SubmitButton({ children, state }: FormButtonProps) {
  return (
    <Button className="w-full" disabled={state !== "idle"} type="submit">
      {state === "idle" ? children : <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
    </Button>
  )
}
