"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, User, Calendar } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import { useState } from "react";

export default function AbsensiPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    statusKehadiran: "",
    jamMenyusul: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="w-full max-w-2xl mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="font-medium" style={{ fontFamily: "serif" }}>Kembali ke Beranda</span>
          </Link>
          
          <h1 className="text-5xl font-extrabold text-center mb-2 drop-shadow-lg" style={{ color: "#603017" }}>
            Absensi Day ke-3
          </h1>
          
          <div className="text-center text-lg" style={{ color: "#8B4513", fontFamily: "serif" }}>
            <p className="flex items-center justify-center gap-2 mb-1">
              <Calendar size={18} />
              {getCurrentDate()}
            </p>
            <p className="flex items-center justify-center gap-2">
              <Clock size={18} />
              Waktu Saat Ini: {getCurrentTime()}
            </p>
          </div>
        </div>

        {/* Form Absensi */}
        <section className="w-full max-w-2xl">
          <Card 
            className="relative border-4 shadow-2xl"
            style={{ 
              backgroundColor: "#f4e4bc",
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(101, 67, 33, 0.15) 3px, transparent 3px),
                radial-gradient(circle at 75% 75%, rgba(101, 67, 33, 0.1) 2px, transparent 2px),
                radial-gradient(circle at 60% 40%, rgba(101, 67, 33, 0.08) 4px, transparent 4px),
                radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.12) 2px, transparent 2px),
                radial-gradient(circle at 90% 20%, rgba(160, 82, 45, 0.1) 3px, transparent 3px),
                linear-gradient(45deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%),
                linear-gradient(0deg, rgba(101, 67, 33, 0.02) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px, 30px 30px, 50px 50px, 35px 35px, 45px 45px, 60px 60px, 60px 60px, 80px 80px",
              borderStyle: "solid",
              borderColor: "#8B4513",
              borderImage: "linear-gradient(45deg, #8B4513, #654321, #A0522D, #8B4513) 1",
              boxShadow: `
                0 0 0 2px #654321,
                0 0 0 4px #8B4513,
                inset 0 0 20px rgba(139, 69, 19, 0.3),
                inset 0 0 40px rgba(101, 67, 33, 0.2),
                0 10px 30px rgba(0, 0, 0, 0.4)
              `
            }}
          >
            <CardHeader className="relative">
              {/* Decorative worn corners */}
              <div className="absolute top-1 left-1 w-6 h-6 border-l-3 border-t-3 border-amber-800 opacity-70"></div>
              <div className="absolute top-1 right-1 w-6 h-6 border-r-3 border-t-3 border-amber-800 opacity-70"></div>
              <div className="absolute bottom-1 left-1 w-6 h-6 border-l-3 border-b-3 border-amber-800 opacity-70"></div>
              <div className="absolute bottom-1 right-1 w-6 h-6 border-r-3 border-b-3 border-amber-800 opacity-70"></div>
              
              {/* Age spots and stains */}
              <div className="absolute top-3 left-8 w-3 h-3 rounded-full bg-amber-900 opacity-20"></div>
              <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-amber-800 opacity-25"></div>
              <div className="absolute bottom-8 left-20 w-4 h-2 rounded-full bg-amber-900 opacity-15"></div>
              <div className="absolute top-8 right-6 w-2 h-4 rounded-full bg-amber-800 opacity-20"></div>
              
              {/* Torn edge effects */}
              <div className="absolute top-0 left-16 w-8 h-1 bg-amber-900 opacity-30 transform -skew-x-12"></div>
              <div className="absolute bottom-0 right-20 w-6 h-1 bg-amber-800 opacity-25 transform skew-x-6"></div>
              
              <CardTitle className="text-center text-3xl font-bold mb-4 relative z-10" style={{ 
                color: "#603017",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                fontFamily: "serif"
              }}>
                {isSubmitted ? "Absensi Berhasil!" : "Form Absensi"}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative">
              {/* Background effects */}
              <div className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.4) 2px, transparent 2px),
                    radial-gradient(circle at 80% 20%, rgba(101, 67, 33, 0.5) 3px, transparent 3px),
                    radial-gradient(circle at 40% 40%, rgba(160, 82, 45, 0.3) 2px, transparent 2px),
                    radial-gradient(circle at 70% 70%, rgba(139, 69, 19, 0.6) 1px, transparent 1px),
                    radial-gradient(circle at 10% 30%, rgba(101, 67, 33, 0.4) 2px, transparent 2px)
                  `,
                  backgroundSize: "60px 60px, 80px 80px, 40px 40px, 100px 100px, 70px 70px"
                }}
              ></div>
              
              {/* Water stains and age marks */}
              <div className="absolute top-4 right-8 w-12 h-8 rounded-full bg-amber-900 opacity-10 blur-sm"></div>
              <div className="absolute bottom-12 left-6 w-16 h-6 rounded-full bg-amber-800 opacity-8 blur-sm"></div>
              <div className="absolute top-16 left-12 w-8 h-12 rounded-full bg-amber-900 opacity-12 blur-md"></div>
              
              {/* Crease lines */}
              <div className="absolute top-0 left-1/3 w-px h-full bg-amber-800 opacity-20"></div>
              <div className="absolute top-1/2 left-0 w-full h-px bg-amber-900 opacity-15"></div>

              {isSubmitted ? (
                /* Success Message */
                <div className="text-center relative z-10" style={{ 
                  color: "#603017",
                  fontFamily: "serif"
                }}>
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-600 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Terima Kasih!</h3>
                    <p className="text-lg mb-2">Absensi Anda telah tercatat pada:</p>
                    <p className="font-bold text-xl mb-4">{getCurrentTime()}</p>
                  </div>
                  
                  <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-800 mb-6">
                    <h4 className="font-semibold mb-2">Detail Absensi:</h4>
                    <div className="text-left space-y-1">
                      <p><strong>Status Kehadiran:</strong> {formData.statusKehadiran}</p>
                      {(formData.statusKehadiran === "Menyusul" || formData.statusKehadiran === "Meninggalkan") && formData.jamMenyusul && (
                        <p><strong>Jam {formData.statusKehadiran}:</strong> {formData.jamMenyusul}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Link href="/">
                      <button 
                        className="px-6 py-3 rounded-md hover:opacity-90 transition font-medium shadow-lg text-white border-2 border-amber-800 transform hover:scale-105"
                        style={{ 
                          backgroundColor: "#603017",
                          fontFamily: "serif",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
                        }}
                      >
                        Kembali ke Beranda
                      </button>
                    </Link>
                    <button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          statusKehadiran: "",
                          jamMenyusul: ""
                        });
                      }}
                      className="px-6 py-3 rounded-md hover:opacity-90 transition font-medium shadow-lg border-2 border-amber-800 transform hover:scale-105"
                      style={{ 
                        backgroundColor: "transparent",
                        color: "#603017",
                        fontFamily: "serif"
                      }}
                    >
                      Absen Lagi
                    </button>
                  </div>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid gap-6">
                    {/* Status Kehadiran */}
                    <div>
                      <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                        color: "#603017",
                        fontFamily: "serif"
                      }}>
                        <Clock size={18} />
                        Status Kehadiran
                      </label>
                      <select
                        name="statusKehadiran"
                        value={formData.statusKehadiran}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border-2 border-amber-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                        style={{ 
                          backgroundColor: "#fef7ed",
                          fontFamily: "serif"
                        }}
                      >
                        <option value="">Pilih Status Kehadiran</option>
                        <option value="Hadir">Hadir</option>
                        <option value="Izin">Izin</option>
                        <option value="Menyusul">Menyusul</option>
                        <option value="Meninggalkan">Meninggalkan</option>
                      </select>
                    </div>

                    {/* Input Jam untuk Menyusul/Meninggalkan */}
                    {(formData.statusKehadiran === "Menyusul" || formData.statusKehadiran === "Meninggalkan") && (
                      <div>
                        <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                          color: "#603017",
                          fontFamily: "serif"
                        }}>
                          <Clock size={18} />
                          Jam {formData.statusKehadiran}
                        </label>
                        <input
                          type="time"
                          name="jamMenyusul"
                          value={formData.jamMenyusul}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border-2 border-amber-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                          style={{ 
                            backgroundColor: "#fef7ed",
                            fontFamily: "serif"
                          }}
                        />
                        <p className="text-sm mt-1" style={{ 
                          color: "#8B4513",
                          fontFamily: "serif"
                        }}>
                          {formData.statusKehadiran === "Menyusul" 
                            ? "Masukkan jam ketika Anda akan menyusul" 
                            : "Masukkan jam ketika Anda akan meninggalkan"
                          }
                        </p>
                      </div>
                    )}

                    
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-4">
                    <button 
                      type="submit"
                      className="px-8 py-4 rounded-md hover:opacity-90 transition font-medium shadow-lg text-white border-2 border-amber-800 transform hover:scale-105 text-lg"
                      style={{ 
                        backgroundColor: "#603017",
                        fontFamily: "serif",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
                      }}
                    >
                      Submit Absensi
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
