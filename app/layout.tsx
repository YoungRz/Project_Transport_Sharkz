import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/authprovider";
import Header from "./components/header";

// Barlow dirancang dari huruf rambu jalan raya. Versi condensed untuk judul dan kode rute.
const sans = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Transportasi Umum",
  description: "Daftar rute dan halte transportasi umum",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${sans.variable} ${display.variable}`}>
      <body>
        <AuthProvider>
          <Header />
          <main>
            <div className="wrap">{children}</div>
          </main>
          <footer>
            <div className="wrap">Proyek sekolah: Express, MySQL, dan Next.js</div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}