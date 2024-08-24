import { ActionFunctionArgs } from "@remix-run/node"
import { Form, useParams } from "@remix-run/react"
import { useEffect, useState } from "react"
import { createBroadcaster } from "@tremendo-studio/flyio-broadcast"

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const message = formData.get("message")

  const { broadcast } = createBroadcaster(process.env.FLY_APP_NAME!, `/api/sync/${params.id}`)
  const result = await broadcast(JSON.stringify({ message }))

  return { result }
}

export default function Rooms() {
  const [messages, setMessages] = useState<string[]>([])
  const params = useParams()

  useEffect(() => {
    const eventSource = new EventSource(`/api/sync/${params.id}`)

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data)
      setMessages((prevMessages) => [...prevMessages, newMessage])
    }

    return () => {
      eventSource.close()
    }
  }, [params.id])

  return (
    <div>
      <Form method="post">
        <label>
          Message: <input type="text" name="message" />
        </label>
        <button type="submit">Send</button>
      </Form>
      {messages.map((message) => (
        <pre key={`${Math.random}`}>{JSON.stringify(message, null, 2)}</pre>
      ))}
    </div>
  )
}
