import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'I Wonder'
export const contentType = 'image/png'
export const runtime = 'edge'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background:
            'linear-gradient(135deg, #0f1115 0%, #151923 45%, #1d2330 100%)',
          color: '#f7f7f2',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 700,
            }}
          >
            I
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '28px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              I Wonder
            </div>
            <div
              style={{
                marginTop: '4px',
                fontSize: '18px',
                color: 'rgba(247, 247, 242, 0.72)',
              }}
            >
              Music database for lyrics, background, and context
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            style={{
              maxWidth: '900px',
              fontSize: '64px',
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            Read music through lyrics, background, and context.
          </div>
          <div
            style={{
              maxWidth: '760px',
              fontSize: '28px',
              lineHeight: 1.35,
              color: 'rgba(247, 247, 242, 0.82)',
            }}
          >
            I Wonder is a music database for artists, albums, and songs.
          </div>
        </div>
      </div>
    ),
  )
}
