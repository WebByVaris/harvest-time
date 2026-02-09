"use client"

import { useEffect, useState } from "react"
import FloatingMenu from "@/components/FloatingMenu"

export default function LoginPage() {
  const [isAuthorizing, setIsAuthorizing] = useState(false)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "OAUTH_SUCCESS") {
        setIsAuthorizing(false)
        window.location.href = "/time-entry"
      } else if (event.data.type === "OAUTH_ERROR") {
        setIsAuthorizing(false)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleAuthorize = () => {
    try {
      setIsAuthorizing(true)
      const popup = window.open("/api/auth/login", "harvest_oauth",
        "width=500,height=600,scrollbars=yes,resizable=yes,location=yes"
      )

      if (popup) {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            if (isAuthorizing) {
              setIsAuthorizing(false)
            }
          }
        }, 1000)
      } else {
        throw new Error("Popup blocked")
      }
    } catch {
      setIsAuthorizing(false)
      if (window.top && window.top !== window.self) {
        try {
          window.top.postMessage({ type: "OPEN_OAUTH", url: "/api/auth/login" }, "*")
        } catch {
          window.location.href = "/api/auth/login"
        }
      } else {
        window.location.href = "/api/auth/login"
      }
    }
  }

  return (
    <>

      <FloatingMenu />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Welcome to Time Tracker</h1>
        <p className="mb-4 text-center">
          You need to be signed into a Harvest account!
        </p>
        <button onClick={handleAuthorize} className="hover:cursor-pointer bg-[#6e3fff] hover:bg-[#5319e0] px-4 py-2 rounded-full text-white font-medium">Sign In</button>
      </div>
    </>
  )
}


