import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart-study",
  description: "Created by DKreactive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
