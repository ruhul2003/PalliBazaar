import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PalliBazaar",
  description: "PalliBazaar Next.js App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}