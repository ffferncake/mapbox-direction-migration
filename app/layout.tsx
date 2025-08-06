import type { Metadata } from "next";
import "./globals.css";
// import LeftNav from "./_components/feature/LeftNav/LeftNav";
// import { Roboto } from "next/font/google";
import Header from "./_components/feature/Header/Header";
import ClientLayerHandler from "./ClientLayerHandler";

// const roboto = Roboto({
//   weight: ["400", "500", "700"],
//   subsets: ["latin"]
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
          <main
            style={{
              flex: 1,
              overflow: "hidden",
              margin: 0,
              padding: 0,
            }}
          >
            
            {children}
            <ClientLayerHandler />
          </main>
        </div>
      </body>
    </html>
  );
}
