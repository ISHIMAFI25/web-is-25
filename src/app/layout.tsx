// src/app/layout.tsx
import type { Metadata } from "next";
import { Cinzel, Roboto } from "next/font/google"; // Hapus Inter yang tidak digunakan
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

// Inisialisasi font Cinzel. Kita akan menggunakan ini untuk seluruh body.
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700'], // Bobot yang umum digunakan untuk teks
  display: 'swap',
  variable: '--font-cinzel', // Tambahkan variabel CSS untuk Cinzel
});

// Inisialisasi font Roboto untuk placeholder
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400'], // Bobot yang umum digunakan untuk placeholder
  display: 'swap',
  variable: '--font-roboto', // Tambahkan variabel CSS untuk Roboto
});

// Mengatur font Inter sebagai fallback atau untuk elemen lain
// Note: inter is prepared for future use but currently using roboto
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intellektuelle Schule 25",
  description: "Website IS 25",
  icons: {
    icon: '/favicon_v1.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Terapkan font Cinzel sebagai default dan sediakan variabel Roboto */}
      <body className={`${cinzel.className} ${roboto.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
