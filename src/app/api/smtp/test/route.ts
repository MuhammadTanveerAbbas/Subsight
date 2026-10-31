import { getAuthenticatedUser } from '@/lib/api-auth'
import { testSmtpConnection } from '@/lib/email-service'

/**
 * POST /api/smtp/test
 * Tests the SMTP connection using the server-side environment variables.
 * Requires an authenticated user credentials are never sent to or from the client.
 */
export async function POST() {
  const auth = await getAuthenticatedUser({ requireVerified: false })
  if (!auth.user) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const result = await testSmtpConnection()
  return Response.json(result, { status: result.ok ? 200 : 400 })
}
