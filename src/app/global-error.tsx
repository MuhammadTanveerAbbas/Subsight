"use client"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-bold">Critical error</h1>
            <p className="text-muted-foreground">
              A critical error occurred. Please refresh the page.
            </p>
            <button onClick={() => reset()}>Refresh</button>
          </div>
        </div>
      </body>
    </html>
  )
}
