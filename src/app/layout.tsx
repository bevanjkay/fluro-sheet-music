import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fluro Sheet Music Viewer",
  description: "A sheet music viewer for Fluro church management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}