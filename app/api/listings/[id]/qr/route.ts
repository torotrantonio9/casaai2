import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const listingUrl = `${appUrl}/annunci/${id}`

    const qrBuffer = await QRCode.toBuffer(listingUrl, {
      type: 'png',
      width: 300,
      margin: 2,
      color: { dark: '#1e40af', light: '#ffffff' },
    })

    return new Response(new Uint8Array(qrBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Errore generazione QR'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
