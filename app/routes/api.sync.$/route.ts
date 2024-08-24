import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node"

let clients: {
  write: (message: string | undefined) => void
  close: () => void
}[] = []

export function sendEvent(message: string | undefined) {
  clients.forEach((client) => client.write(`data: ${JSON.stringify(message)}\n\n`))
}

export async function loader({ request }: LoaderFunctionArgs) {
  const stream = new ReadableStream({
    start(controller) {
      const client = {
        write: (message: string | undefined) =>
          controller.enqueue(new TextEncoder().encode(message)),
        close: () => controller.close(),
      }

      clients.push(client)

      request.signal.addEventListener("abort", () => {
        clients = clients.filter((c) => c !== client)
        client.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json()
  sendEvent(JSON.stringify(data))

  return json({ status: "Success" })
}
