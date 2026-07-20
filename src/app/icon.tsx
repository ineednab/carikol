import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 55%, #EC4899 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 13,
            height: 13,
            borderRadius: "50%",
            border: "2.5px solid rgba(255,255,255,0.9)",
            position: "absolute",
            top: 6,
            left: 5,
          }}
        />
        <div
          style={{
            width: 3,
            height: 8,
            background: "rgba(255,255,255,0.9)",
            borderRadius: 2,
            position: "absolute",
            top: 18,
            left: 20,
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    { ...size }
  )
}
