import type { Metadata } from "next";
import "./globals.css";
import { playfair, inter } from "./fonts";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Tricea NG",
  description: "Luxury footwear, thoughtfully crafted.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`}>
  <Navbar />
{children}
<Footer />
</body>
    </html>
  );
}