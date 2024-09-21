import { Link } from "@remix-run/react"
import { CircleUserRound } from "lucide-react"

import { buttonVariants } from "~/components/ui/button"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-10 py-10">
      <header className="bg-background flex h-10 items-center justify-end border-b">
        <nav className="flex gap-x-1 pb-1 text-lg font-medium md:text-sm">
          <Link className={buttonVariants({ size: "sm", variant: "ghost" })} to="/sign-up">
            <CircleUserRound strokeWidth={1.5}></CircleUserRound>
          </Link>
        </nav>
      </header>
      <h1 className="mt-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Dashboard
      </h1>
    </div>
  )
}
