import { useLoaderData } from "@remix-run/react"
import { createBroadcaster } from "@tremendo-studio/flyio-broadcast"

export async function loader() {
  const { getIPs, broadcast } = createBroadcaster(process.env.FLY_APP_NAME!, "/api/sync")

  const ips = await getIPs()
  const results = await broadcast(JSON.stringify({ message: "Testing" }))

  return { ips, results, privateIp: process.env?.FLY_PRIVATE_IP }
}

export default function Urls() {
  const { ips, results, privateIp } = useLoaderData<typeof loader>()

  return (
    <div>
      <pre>{privateIp}</pre>
      <pre>{JSON.stringify(ips, null, 2)}</pre>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  )
}
