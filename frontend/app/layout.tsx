import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/lib/auth";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: "Transport Kota",
  description: "Cari rute dan halte transportasi umum",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
