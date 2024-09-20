import { ReactNode, useEffect, useRef, useState } from "react"

export function FluidContainer({ children }: { children: ReactNode }) {
  const outerContainer = useRef<HTMLDivElement>(null)
  const innerContainer = useRef<HTMLDivElement>(null)

  const [height, setHeight] = useState(0)
  const [showInnerContainer, setShowInnerContainer] = useState(false)

  useEffect(() => {
    if (!innerContainer.current) return

    const observer = new ResizeObserver(() => {
      setHeight(innerContainer.current?.offsetHeight as number)
    })
    observer.observe(innerContainer.current)
    return () => observer.disconnect()
  }, [innerContainer])

  useEffect(() => {
    if (!outerContainer.current) return

    const container = outerContainer.current
    const handleTransitionEnd = () => {
      setShowInnerContainer(height !== 0)
    }
    container.addEventListener("transitionend", handleTransitionEnd)
    return () => container.removeEventListener("transitionend", handleTransitionEnd)
  }, [height, outerContainer])

  return (
    <div
      ref={outerContainer}
      style={{ height: height, overflow: "hidden", transition: "height 0.15s ease-out" }}
    >
      <div ref={innerContainer} style={{ visibility: showInnerContainer ? undefined : "hidden" }}>
        {children}
      </div>
    </div>
  )
}
