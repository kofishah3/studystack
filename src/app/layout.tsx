import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { PromptProvider } from "@/contexts/PromptContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { TooltipProvider } from "@/contexts/TooltipContext";
import { SocketProvider } from "@/contexts/SocketContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyStack - The Community-Driven Learning Platform",
  description:
    "A community-driven learning platform designed for students to collaborate through interactive Q&A and comprehensive tutorials",
  keywords: [
    "education",
    "learning platform",
    "student collaboration",
    "Q&A",
    "tutorials",
  ],
  authors: [{ name: "StudyStack Team" }],
  creator: "StudyStack",
  openGraph: {
    title: "StudyStack",
    description:
      "A community-driven learning platform designed for students to collaborate through interactive Q&A and comprehensive tutorials",
    url: "studystack-jet.vercel.app",
    siteName: "StudyStack",
    images: [
      {
        url: "/logos/studystack-logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyStack",
    description:
      "A community-driven learning platform designed for students to collaborate through interactive Q&A and comprehensive tutorials",
    images: ["/logos/studystack-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logos/studystack-logo.png",
    apple: "/logos/studystack-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-text">
        <SocketProvider>
          <PromptProvider>
            <ToastProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </ToastProvider>
          </PromptProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
