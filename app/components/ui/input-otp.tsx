import { DashIcon } from "@radix-ui/react-icons"
import { OTPInput, OTPInputContext } from "input-otp"
import * as React from "react"

import { cn } from "~/lib/utils"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    className={cn("disabled:cursor-not-allowed", className)}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName,
    )}
    ref={ref}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div className={cn("flex items-center", className)} ref={ref} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  { index: number } & React.ComponentPropsWithoutRef<"div">
>(({ className, index, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-stone-200 text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md dark:border-stone-800",
        isActive && "z-10 ring-1 ring-stone-950 dark:ring-stone-300",
        className,
      )}
      ref={ref}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-stone-950 duration-1000 dark:bg-stone-50" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <DashIcon />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot }
