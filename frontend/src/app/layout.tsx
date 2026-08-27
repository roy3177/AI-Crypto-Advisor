import type { Metadata } from "next";
import { Figtree, Sora } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider, ThemeScript } from "@/lib/theme-context";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Advisor",
  description: "A personalized crypto-investor dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${sora.variable} h-full antialiased`}
      // ThemeScript (in <head> below) adds/removes the "dark" class on this
      // element before React hydrates, so its className legitimately
      // differs from what the server rendered -- an intentional exception,
      // not a bug (this is Next.js's own documented pattern for a
      // light/dark toggle that must avoid a flash of the wrong theme).
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}
