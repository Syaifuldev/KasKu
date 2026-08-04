/**
 * Root Layout — KasKu App
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const getAppUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return "http://localhost:3000";
  return url.startsWith("http") ? url : `https://${url}`;
};

const appUrl = getAppUrl();

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "KasKu — Aplikasi Pencatatan Kas",
    template: "%s | KasKu",
  },
  description:
    "Aplikasi pencatatan kas sederhana, cepat, dan modern. Kelola pemasukan dan pengeluaran dengan mudah menggunakan workspace.",
  keywords: ["kas", "keuangan", "pencatatan", "pemasukan", "pengeluaran", "workspace"],
  authors: [{ name: "KasKu" }],
  creator: "KasKu",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "KasKu — Aplikasi Pencatatan Kas",
    description: "Aplikasi pencatatan kas sederhana, cepat, dan modern.",
    url: appUrl,
    siteName: "KasKu",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KasKu — Aplikasi Pencatatan Kas",
    description: "Aplikasi pencatatan kas sederhana, cepat, dan modern.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                }}
              />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
