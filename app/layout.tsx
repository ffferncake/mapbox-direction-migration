import type { Metadata } from "next";
import "./globals.css";
import LeftNav from "./_components/feature/LeftNav/LeftNav";
// import { Roboto } from "next/font/google";
import Header from "./_components/feature/Header/Header";

// const roboto = Roboto({
//   subsets: ["latin"],
//   weight: ["400", "700"], // include weights you actually need
//   variable: "--font-roboto", // for Tailwind use
//   display: "swap"
// });

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
            height: "100vh",
            display: "flex",
            overflow: "hidden",
            margin: 0,
            padding: 0
          }}
        >
          <LeftNav />
          <main style={{
            flex: 1,
            overflow: "hidden",
            margin: 0,
            padding: 0
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
