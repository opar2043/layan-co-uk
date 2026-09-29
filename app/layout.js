import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Layan — Book your next salon appointment",
    template: "%s | Layan",
  },
  description:
    "Layan is a booking marketplace for salons, barbers and nail bars. Discover verified businesses, book a slot in seconds, and manage every appointment in one place.",
  applicationName: "Layan",
  keywords: ["salon booking", "barber", "nail bar", "appointments", "beauty marketplace", "Layan"],
  openGraph: {
    type: "website",
    siteName: "Layan",
    title: "Layan — Book your next salon appointment",
    description:
      "Discover verified salons, barbers and nail bars. Book a slot in seconds and manage every appointment in one place.",
    url: "/",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Layan — Book your next salon appointment",
    description: "Discover verified salons, barbers and nail bars and book a slot in seconds.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F4F0E8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" className={jakarta.variable}>
      <body className="min-h-screen bg-background font-sans text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
