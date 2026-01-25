import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
    default: "Pickleball Gear Win Tracker",
    template: "%s | Pickleball Gear Win Tracker",
  },
  description:
    "Track which paddles and shoes are winning the most points on the pro pickleball tour.",
  keywords: [
    "pickleball",
    "paddles",
    "shoes",
    "equipment",
    "pro tour",
    "PPA",
    "MLP",
    "rankings",
  ],
  openGraph: {
    title: "Pickleball Gear Win Tracker",
    description:
      "Track which paddles and shoes are winning the most points on the pro pickleball tour.",
    type: "website",
  },
};

function Header() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-foreground">
            <span className="text-primary">Pickleball</span> Gear
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/gear"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Equipment
            </Link>
            <Link
              href="/players"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Players
            </Link>
            <Link
              href="/tournaments"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Tournaments
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} Pickleball Gear Win Tracker</p>
        <p className="mt-2">
          Data sourced from official tournament results and verified equipment
          usage.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
