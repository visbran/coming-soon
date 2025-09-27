import "./globals.css";
import { ThemeProvider } from "./theme-provider";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import data from "@data/data";

export const metadata: Metadata = {
  metadataBase: new URL(data.siteurl),
  title: `${data.sitename} - ${data.sitetagline}`,
  description: data.description,
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: data.sitename,
    description: data.sitetagline,
    url: data.siteurl,
    siteName: data.sitename,
    images: [
      {
        url: '/Home-Comming-soon-Template.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-gray-200 min-h-screen dark:bg-[#0d1117]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="main">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
