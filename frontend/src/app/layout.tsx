import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AudioPlayer } from "@/components/AudioPlayer";
import { AuthProvider } from "@/contexts/AuthContext";
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
  title: {
    default: "AudioTruyện - Nghe Truyện Audio Online Miễn Phí",
    template: "%s | AudioTruyện",
  },
  description:
    "Nghe truyện audio miễn phí với chất lượng cao. Hàng ngàn tác phẩm từ Tiên Hiệp, Kiếm Hiệp, Ngôn Tình đến Trinh Thám, Truyện Ma.",
  keywords: [
    "nghe truyện",
    "truyện audio",
    "audio book",
    "tiên hiệp",
    "kiếm hiệp",
    "ngôn tình",
    "truyện ma",
  ],
  authors: [{ name: "AudioTruyện" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "AudioTruyện",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <AudioPlayer />
        </AuthProvider>
      </body>
    </html>
  );
}
