import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MangaCap - Read Manga Online",
  description: "Your favorite place to read manga online for free",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <UserProvider>
            <div className="bg-gray-950 dark:bg-gray-950 bg-white text-gray-900 dark:text-white min-h-screen">
              <Header />
              <main>{children}</main>
            </div>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}