"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { UserRoundCheck } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        {/* Judul Web */}
        <h1 className="text-6xl font-extrabold mb-8 drop-shadow-lg" style={{ color: "#603017" }}>
          IS 2025
        </h1>

        {/* Kolom Informasi */}
        <section className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold mb-4" style={{ color: "#603017" }}>
              Day ke-3
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-6">
            {/* Informasi */}
            <div>
              <div className="space-y-2 text-gray-700">
                <p><strong>Materi:</strong> Algoritma dan Pemrograman Dasar</p>
                <p><strong>Waktu:</strong> 08.00 - 15.00 WIB</p>
                <p><strong>Ruangan:</strong> Lab Komputer 2</p>
              </div>
            </div>

            {/* Spek */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-left">Spek:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Laptop/Notebook</li>
                <li>Charger Laptop</li>
                <li>Mouse (Opsional)</li>
                <li>Buku Catatan dan Alat Tulis</li>
                <li>Botol Minum</li>
              </ul>
            </div>

            {/* Tombol Absen */}
            <div className="flex justify-center pt-4">
              <Link href="/absensi">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium flex items-center gap-2">
                  <UserRoundCheck size={20} />
                  Absen Sekarang
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
      </div>
    </div>
  );
}