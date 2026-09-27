import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import { LibraryProvider } from "@/components/LibraryProvider";
import Navbar from "@/components/Navbar";
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
  title: "Projecto",
  description: "Preview your EP or album in a streaming platform UI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LibraryProvider>
          <Navbar />
          {/* At least one screen tall (minus the 3.5rem nav), so the footer
              always starts below the fold and appears only on scroll. */}
          <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
            {children}
          </div>
          <Footer />
        </LibraryProvider>
      </body>
    </html>
  );
}
