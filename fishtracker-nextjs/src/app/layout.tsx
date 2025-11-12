import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FishTracker - AI Fish Identification & Tracking",
  description: "Track and identify fish species using AI-powered image recognition. Learn about marine life, conservation status, and fish habitats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
