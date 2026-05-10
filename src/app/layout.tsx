import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buy&Sell | Discover. Negotiate. Own.",
  description: "High-end marketplace meets art-house publication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-[var(--color-accent)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
