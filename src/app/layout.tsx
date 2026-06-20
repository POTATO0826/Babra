import type { Metadata } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "MEETU — Advisory, distilled",
  description:
    "A calm, editorial workspace for the independent financial advisor: leads, meetings, and client profiles held in one quiet place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink-soft">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
