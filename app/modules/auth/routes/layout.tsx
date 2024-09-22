import { Outlet } from "@remix-run/react"

export default function Auth() {
  return (
    <div className="container m-auto px-4 pt-12 lg:pt-32">
      <Outlet />
    </div>
  )
}
