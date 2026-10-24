import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond, Cinzel } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast-provider";
import { StoreProvider } from "@/lib/store";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fontSerif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontBrand = Cinzel({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Car rental Abuja",
    "Luxury cars Nigeria",
    "Homes for rent Maitama",
    "Properties for sale Abuja",
    "RMB exchange Naira",
    "WeChat Alipay exchange Nigeria",
    "BZ Group Global Universal Solutions",
  ],
  authors: [{ name: "BZ Group" }],
  icons: {
    icon: "/brand/emblem.svg",
    shortcut: "/brand/emblem.svg",
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
      suppressHydrationWarning
      className={cn(
        fontSans.variable,
        fontSerif.variable,
        fontBrand.variable,
        "scroll-smooth"
      )}
    >
      <body className="min-h-screen bg-surface-bg text-text-main font-sans selection:bg-wine-100 selection:text-wine-900">
        <ThemeProvider>
          <StoreProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
