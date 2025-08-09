// /app/api/kma-proxy/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://apihub.kma.go.kr/api/typ01/url/typ_data.php?YY=2025&typ=9&mode=1&authKey=He0LTvHDS12tC07xw2td7A";

  const res = await fetch(url);

  const text = await res.text();

  console.log("text:::", text);

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
    },
  });
}
