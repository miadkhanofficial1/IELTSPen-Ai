import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IELTSPen Ai — WRITE SMARTER. SCORE HIGHER.",
  description:
    "Official cross-platform IELTS Writing Practice application for Task 1 & Task 2. Instant AI Band Scoring, iOS fluid glass UI, cheat detection, and detailed criterion evaluations.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IELTSPen Ai",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${plusJakartaSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans min-h-screen relative overflow-x-hidden transition-colors duration-300">
        <ThemeProvider>
          {/* iOS Drifting Ambient Gradient Orbs */}
          <div className="ambient-glow-wrapper" aria-hidden="true">
            <div className="ambient-orb-crimson animate-drift-crimson" />
            <div className="ambient-orb-slate animate-drift-slate" />
          </div>

          {/* Main Content Layer */}
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
