import { promises as dns } from "dns"

const PRIVATE_IP = process.env?.FLY_PRIVATE_IP ?? ""
const APP_NAME = process.env?.APP_NAME ?? ""

export async function broadcastToAllInstances<D>(path: string, data: D | unknown) {
  const instanceIPs = (await getAllInstanceIPs()).filter((ip) => ip !== PRIVATE_IP)

  const broadcastPromises = instanceIPs.map(async (ip) => {
    try {
      const response = await fetch(`http://[${ip}]:${process.env.PORT}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to broadcast to ${ip}: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error broadcasting to ${ip}:`, error)
    }
  })

  await Promise.all(broadcastPromises)
}

export async function getAllInstanceIPs() {
  try {
    return await dns.resolve6(`${APP_NAME}.internal`)
  } catch (error) {
    return []
  }
}
