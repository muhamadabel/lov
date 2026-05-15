import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "LOVie",
  description: "A cinematic personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorantGaramond.variable} ${dmSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
