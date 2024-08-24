import { Outlet, useLoaderData } from "@remix-run/react"

export async function loader() {
  return { env: process.env }
}

export default function Index() {
  const { env } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Send Message to All Instances</h1>
      <p>Machine id: {env.FLY_MACHINE_ID}</p>
      <p>Private ID: {env.FLY_PRIVATE_IP}</p>
      <Outlet />
    </div>
  )
}
