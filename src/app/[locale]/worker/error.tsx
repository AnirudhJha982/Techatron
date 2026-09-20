"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WorkerErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Worker Portal Error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
          ⚠️
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Something Went Wrong</h2>
          <p className="text-sm text-slate-600">
            {error?.message || "An unexpected error occurred while processing your request in the Worker Portal."}
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-slate-400">Digest: {error.digest}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={() => reset()}
            className="bg-green-800 hover:bg-green-700 text-white font-bold"
          >
            Try Again 🔄
          </Button>
          <Link href="/en/worker/dashboard">
            <Button variant="outline" className="w-full sm:w-auto font-bold">
              Worker Dashboard 🏠
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
