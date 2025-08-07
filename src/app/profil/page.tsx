"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, User, Shield, Eye, EyeOff, Map, Compass, ScrollText } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useState } from "react";

function ProfilContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Data profil (dalam aplikasi nyata, ini akan dari database/API)
  const profileData = {
    nama: "Frodo Baggins",
    nim: "200101010",
    email: "frodo.baggins@shire.edu"
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic untuk ganti password akan ditambahkan di sini
    console.log("Password change submitted:", passwordData);
    alert("Password berhasil diubah!");
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Efek kompas di pojok */}
      <div className="fixed top-10 right-10 w-32 h-32 opacity-30 z-10">
        <Compass size={128} className="text-amber-800" />
      </div>
      
      {/* Efek gulungan di pojok kiri */}
      <div className="fixed bottom-10 left-10 w-24 h-24 opacity-35 z-10">
        <ScrollText size={96} className="text-amber-900" />
      </div>

      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        {/* Header */}
        <div className="w-full max-w-4xl mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="font-medium" style={{ fontFamily: "serif" }}>Kembali ke Beranda</span>
          </Link>
          
          <div className="text-center mb-6">
            <h1 className="text-6xl font-extrabold mb-2 drop-shadow-lg" style={{ 
              color: "#603017",
              fontFamily: "serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
            }}>
              Peta Petualang
            </h1>
            <p className="text-xl" style={{ 
              color: "#8B4513", 
              fontFamily: "serif"
            }}>
              ~ Profil Sang Penjelajah ~
            </p>
          </div>
        </div>

        {/* Profile Cards Container */}
        <div className="w-full max-w-4xl grid gap-6 md:grid-cols-2">
          {/* Profile Information Card */}
          <Card 
            className="relative border-4 shadow-2xl transform hover:scale-105 transition-transform duration-300"
            style={{ 
              backgroundColor: "#f4e4bc",
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(101, 67, 33, 0.15) 3px, transparent 3px),
                radial-gradient(circle at 75% 75%, rgba(139, 69, 19, 0.1) 2px, transparent 2px),
                linear-gradient(45deg, rgba(160, 82, 45, 0.05) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%)
              `,
              backgroundSize: "60px 60px, 40px 40px, 80px 80px, 80px 80px",
              borderStyle: "solid",
              borderColor: "#8B4513",
              borderImage: "linear-gradient(45deg, #8B4513, #654321, #A0522D, #8B4513) 1",
              boxShadow: `
                0 0 0 2px #654321,
                0 0 0 4px #8B4513,
                inset 0 0 20px rgba(139, 69, 19, 0.3),
                inset 0 0 40px rgba(101, 67, 33, 0.2),
                0 15px 35px rgba(0, 0, 0, 0.4)
              `
            }}
          >
            <CardHeader className="relative">
              {/* Decorative corners */}
              <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-amber-800 opacity-70"></div>
              <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-amber-800 opacity-70"></div>
              <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-amber-800 opacity-70"></div>
              <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-amber-800 opacity-70"></div>
              
              {/* Map elements */}
              <div className="absolute top-4 right-6 w-6 h-6 opacity-30">
                <Map size={24} className="text-amber-900" />
              </div>
              
              <CardTitle className="text-center text-3xl font-bold mb-4 relative z-10" style={{ 
                color: "#603017",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                fontFamily: "serif"
              }}>
                Pergamena Identitas
              </CardTitle>
            </CardHeader>

            <CardContent className="relative">
              {/* Background texture */}
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 30% 60%, rgba(139, 69, 19, 0.6) 2px, transparent 2px),
                    radial-gradient(circle at 70% 30%, rgba(101, 67, 33, 0.5) 3px, transparent 3px)
                  `,
                  backgroundSize: "80px 80px, 100px 100px"
                }}
              />
              
              {/* Age spots */}
              <div className="absolute top-6 right-8 w-4 h-4 rounded-full bg-amber-900 opacity-15"></div>
              <div className="absolute bottom-8 left-6 w-6 h-3 rounded-full bg-amber-800 opacity-12"></div>
              
              <div className="space-y-6 relative z-10">
                {/* Avatar placeholder */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full border-4 border-amber-800 flex items-center justify-center" style={{ backgroundColor: "#8B4513" }}>
                    <User size={48} className="text-amber-100" />
                  </div>
                </div>

                {/* Profile fields */}
                <div className="space-y-4">
                  <div>
                    <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                      color: "#603017",
                      fontFamily: "serif"
                    }}>
                      <User size={18} />
                      Nama Petualang
                    </label>
                    <div className="w-full p-3 border-2 border-amber-800 rounded-md" style={{ 
                      backgroundColor: "#fef7ed",
                      fontFamily: "serif",
                      color: "#603017"
                    }}>
                      {profileData.nama}
                    </div>
                  </div>

                  <div>
                    <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                      color: "#603017",
                      fontFamily: "serif"
                    }}>
                      <ScrollText size={18} />
                      Nomor Identitas Magis (NIM)
                    </label>
                    <div className="w-full p-3 border-2 border-amber-800 rounded-md" style={{ 
                      backgroundColor: "#fef7ed",
                      fontFamily: "serif",
                      color: "#603017"
                    }}>
                      {profileData.nim}
                    </div>
                  </div>

                  <div>
                    <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                      color: "#603017",
                      fontFamily: "serif"
                    }}>
                      <Map size={18} />
                      Alamat Surat Burung Hantu
                    </label>
                    <div className="w-full p-3 border-2 border-amber-800 rounded-md" style={{ 
                      backgroundColor: "#fef7ed",
                      fontFamily: "serif",
                      color: "#603017"
                    }}>
                      {profileData.email}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card 
            className="relative border-4 shadow-2xl transform hover:scale-105 transition-transform duration-300"
            style={{ 
              backgroundColor: "#f4e4bc",
              backgroundImage: `
                radial-gradient(circle at 25% 75%, rgba(101, 67, 33, 0.15) 3px, transparent 3px),
                radial-gradient(circle at 75% 25%, rgba(139, 69, 19, 0.1) 2px, transparent 2px),
                linear-gradient(135deg, rgba(160, 82, 45, 0.05) 25%, transparent 25%),
                linear-gradient(-135deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%)
              `,
              backgroundSize: "60px 60px, 40px 40px, 80px 80px, 80px 80px",
              borderStyle: "solid",
              borderColor: "#8B4513",
              borderImage: "linear-gradient(45deg, #8B4513, #654321, #A0522D, #8B4513) 1",
              boxShadow: `
                0 0 0 2px #654321,
                0 0 0 4px #8B4513,
                inset 0 0 20px rgba(139, 69, 19, 0.3),
                inset 0 0 40px rgba(101, 67, 33, 0.2),
                0 15px 35px rgba(0, 0, 0, 0.4)
              `
            }}
          >
            <CardHeader className="relative">
              {/* Decorative corners */}
              <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-amber-800 opacity-70"></div>
              <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-amber-800 opacity-70"></div>
              <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-amber-800 opacity-70"></div>
              <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-amber-800 opacity-70"></div>
              
              {/* Shield icon */}
              <div className="absolute top-4 right-6 w-6 h-6 opacity-30">
                <Shield size={24} className="text-amber-900" />
              </div>
              
              <CardTitle className="text-center text-3xl font-bold mb-4 relative z-10" style={{ 
                color: "#603017",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                fontFamily: "serif"
              }}>
                Segel Keamanan
              </CardTitle>
            </CardHeader>

            <CardContent className="relative">
              {/* Background texture */}
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 40% 70%, rgba(139, 69, 19, 0.6) 2px, transparent 2px),
                    radial-gradient(circle at 60% 20%, rgba(101, 67, 33, 0.5) 3px, transparent 3px)
                  `,
                  backgroundSize: "80px 80px, 100px 100px"
                }}
              />
              
              {/* Age spots */}
              <div className="absolute top-8 left-8 w-5 h-3 rounded-full bg-amber-900 opacity-15"></div>
              <div className="absolute bottom-6 right-6 w-3 h-5 rounded-full bg-amber-800 opacity-12"></div>
              
              <div className="space-y-6 relative z-10">
                {!isChangingPassword ? (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-amber-800 flex items-center justify-center" style={{ backgroundColor: "#8B4513" }}>
                      <Shield size={40} className="text-amber-100" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4" style={{ 
                      color: "#603017",
                      fontFamily: "serif"
                    }}>
                      Ganti Kata Sandi Rahasia
                    </h3>
                    
                    <p className="text-lg mb-6" style={{ 
                      color: "#8B4513",
                      fontFamily: "serif"
                    }}>
                      Lindungi akun petualangan Anda dengan kata sandi yang kuat dan aman
                    </p>
                    
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className="px-8 py-4 rounded-md hover:opacity-90 transition font-medium shadow-lg text-white border-2 border-amber-800 transform hover:scale-105 text-lg"
                      style={{ 
                        backgroundColor: "#603017",
                        fontFamily: "serif",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
                      }}
                    >
                      Ubah Kata Sandi
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitPassword} className="space-y-4">
                    <h3 className="text-2xl font-bold mb-4 text-center" style={{ 
                      color: "#603017",
                      fontFamily: "serif"
                    }}>
                      Perbarui Segel Keamanan
                    </h3>
                    
                    <div>
                      <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                        color: "#603017",
                        fontFamily: "serif"
                      }}>
                        <Shield size={18} />
                        Kata Sandi Lama
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full p-3 pr-12 border-2 border-amber-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                          style={{ 
                            backgroundColor: "#fef7ed",
                            fontFamily: "serif"
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-800 hover:text-amber-900"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                        color: "#603017",
                        fontFamily: "serif"
                      }}>
                        <Shield size={18} />
                        Kata Sandi Baru
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full p-3 border-2 border-amber-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                        style={{ 
                          backgroundColor: "#fef7ed",
                          fontFamily: "serif"
                        }}
                      />
                    </div>

                    <div>
                      <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                        color: "#603017",
                        fontFamily: "serif"
                      }}>
                        <Shield size={18} />
                        Konfirmasi Kata Sandi
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full p-3 border-2 border-amber-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                        style={{ 
                          backgroundColor: "#fef7ed",
                          fontFamily: "serif"
                        }}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit"
                        className="flex-1 px-6 py-3 rounded-md hover:opacity-90 transition font-medium shadow-lg text-white border-2 border-amber-800 transform hover:scale-105"
                        style={{ 
                          backgroundColor: "#603017",
                          fontFamily: "serif",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
                        }}
                      >
                        Simpan Perubahan
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: ""
                          });
                        }}
                        className="flex-1 px-6 py-3 rounded-md hover:opacity-90 transition font-medium shadow-lg border-2 border-amber-800 transform hover:scale-105"
                        style={{ 
                          backgroundColor: "transparent",
                          color: "#603017",
                          fontFamily: "serif"
                        }}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="w-full max-w-4xl mt-8">
          <div className="text-center p-6 rounded-lg border-2 border-amber-800" style={{ 
            backgroundColor: "rgba(244, 228, 188, 0.8)",
            fontFamily: "serif"
          }}>
            <p className="text-lg" style={{ color: "#8B4513" }}>
              💡 <strong>Petunjuk Keamanan:</strong> Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk membuat kata sandi yang kuat. 
              Jangan pernah bagikan kata sandi Anda kepada siapa pun!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <ProtectedRoute>
      <ProfilContent />
    </ProtectedRoute>
  );
}
