import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "streamdown/styles.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aperturehk.vercel.app"),
  title: {
    default: "Aperture",
    template: "%s | Aperture",
  },
  description:
    "Aperture is a Polymarket research analysis platform that classifies events, investigates open-web evidence, and produces structured market recommendations.",
  applicationName: "Aperture",
  keywords: [
    "Aperture",
    "Polymarket",
    "prediction markets",
    "event research",
    "market analysis",
    "Convex",
    "AI research workflow",
  ],
  openGraph: {
    title: "Aperture",
    description:
      "Research Polymarket events with durable workflows, web evidence synthesis, and recommendation memos.",
    siteName: "Aperture",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Aperture",
    description:
      "Polymarket event research with AI-assisted evidence gathering and market recommendation memos.",
  },
  icons: {
    icon: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <ConvexAuthNextjsServerProvider>
              <ConvexClientProvider>
                <NuqsAdapter>{children} </NuqsAdapter>
              </ConvexClientProvider>
            </ConvexAuthNextjsServerProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
