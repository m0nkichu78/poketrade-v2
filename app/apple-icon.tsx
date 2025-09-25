import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

// Image generation
export default async function Icon() {
  // Fetch the favicon from the provided URL
  const icon = await fetch("https://iphonesoft.fr/images/appstore/6479970832/le-jcc-pokemon-pocket-icon.png")
    .then((res) => res.arrayBuffer())
    .then((buffer) => Buffer.from(buffer).toString("base64"))

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(data:image/png;base64,${icon})`,
        backgroundSize: "cover",
      }}
    />,
    {
      ...size,
    },
  )
}
