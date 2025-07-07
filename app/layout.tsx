import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LeftNav from "./feature/LeftNav/LeftNav";
import { Roboto } from "next/font/google";
import Header from "./feature/Header/Header";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900"
// });

// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900"
// });

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"], // include weights you actually need
  variable: "--font-roboto", // for Tailwind use
  display: "swap"
});

export const metadata: Metadata = {
  title: "Situation Map"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="shortcut icon" href="/images/icn_traffic_active.svg" />
      <body
        className="antialiased font-roboto"
        style={{ margin: 0, padding: 0 }}
      >
        <Header />
        <div
          style={{
            paddingTop: "56px",
            height: "100vh",
            display: "flex",
            overflow: "hidden"
          }}
        >
          <LeftNav />
          <main style={{ flex: 1, height: "100%", overflow: "hidden" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
