"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, User, Calendar, Compass, ScrollText, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useState, useEffect } from "react";
import { uploadFotoToUploadThing } from '@/lib/uploadFotoToUploadThing';
import { useAuth } from '@/lib/auth-context';
import { formatJakartaDateTime } from '@/lib/timezoneUtils';
import { extractUserFullName, extractUserUsername, debugUserData } from '@/lib/userUtils';

interface AttendanceSession {
  id: number;
  day_number: number;
  day_title: string;
  is_active: boolean;
  start_time: string | null;
  end_time: string | null;
  auto_close_time: string | null;
}

interface SubmissionResult {
  status_approval: 'Disetujui' | 'Pending' | 'Ditolak';
  approval_message: string;
  feedback_admin?: string;
  message?: string;
}

function AbsensiContent() {
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    statusKehadiran: "",
    jam: "",
    alasan: "",
    buktiFoto: null as File | null
  });
  
  // State untuk loading dan prevent double submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update waktu setiap detik
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval saat component unmount
    return () => clearInterval(timer);
  }, []);

  // Fetch active session dan cek apakah user sudah submit
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      if (!user?.email) return;
      
      try {
        // Get active session
        const sessionResponse = await fetch('/api/attendance-sessions');
        const sessionData = await sessionResponse.json();
        
        if (sessionResponse.ok) {
          const activeSessions = sessionData.sessions?.filter((s: AttendanceSession) => s.is_active) || [];
          
          if (activeSessions.length > 0) {
            const currentActiveSession = activeSessions[0];
            setActiveSession(currentActiveSession);
            
            // Check if user already submitted for this session
            const checkResponse = await fetch('/api/absensi/check-submission', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userEmail: user.email,
                sessionId: currentActiveSession.id
              }),
            });
            
            const checkData = await checkResponse.json();
            if (checkResponse.ok && checkData.hasSubmitted) {
              setAlreadySubmitted(true);
              setIsSubmitted(true); // Set ini agar form tidak muncul
              if (checkData.submissionData) {
                setSubmissionResult({
                  status_approval: checkData.submissionData.status_approval,
                  approval_message: checkData.submissionData.status_approval === 'Disetujui' 
                    ? 'Presensi Anda telah disetujui'
                    : checkData.submissionData.status_approval === 'Pending'
                    ? 'Presensi Anda sedang menunggu persetujuan admin'
                    : 'Presensi Anda ditolak',
                  feedback_admin: checkData.submissionData.feedback_admin
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking attendance status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAttendanceStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || alreadySubmitted || !activeSession) {
      console.log('Cannot submit: already submitting, already submitted, or no active session');
      return;
    }
    
    if (!user?.email) {
      alert('User tidak teridentifikasi. Silakan login ulang.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let fotoUrl = '';
      // Hanya upload foto jika status bukan Hadir
      if (
        formData.statusKehadiran !== 'Hadir' &&
        formData.buktiFoto
      ) {
        console.log('Uploading foto...');
        fotoUrl = await uploadFotoToUploadThing(formData.buktiFoto);
        console.log('Foto uploaded:', fotoUrl);
      }
      
      const absensiData = {
        day_id: activeSession.day_number,
        session_id: activeSession.id,
        user_email: user.email,
        full_name: extractUserFullName(user),
        username: extractUserUsername(user),
        status_kehadiran: formData.statusKehadiran,
        alasan: formData.alasan, // Kondisi kesehatan untuk Hadir, alasan untuk lainnya
        jam_menyusul_meninggalkan: (formData.statusKehadiran === 'Menyusul' || formData.statusKehadiran === 'Meninggalkan') ? formData.jam : null,
        foto_url: fotoUrl || null,
        waktu: new Date().toISOString()
      };
      
      // Debug user data for troubleshooting
      debugUserData(user);
      console.log('Saving absensi data:', absensiData);
      
      // Submit to new API endpoint
      const response = await fetch('/api/absensi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(absensiData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setIsSubmitted(true);
        setAlreadySubmitted(true);
        setSubmissionResult(result);
        
        // Show appropriate message based on status
        if (result.status_approval === 'Disetujui') {
          alert(`${result.message}\n${result.approval_message}`);
        } else {
          alert(`${result.message}\n${result.approval_message}`);
        }
      } else {
        throw new Error(result.error || 'Gagal menyimpan absensi');
      }
      
    } catch (err: unknown) {
      console.error('Error details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi error saat menyimpan absensi';
      alert(`Error: ${errorMessage}`);
    } finally {
      // Reset loading state setelah selesai (baik berhasil atau error)
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (e.target.type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setFormData({
        ...formData,
        buktiFoto: file
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCurrentDate = () => {
    return currentTime.toLocaleDateString('id-ID', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Sidebar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-lg text-amber-800">Memuat data sesi presensi...</div>
        </div>
      </div>
    );
  }

  // No active session
  if (!activeSession) {
    return (
      <div className="min-h-screen relative">
        <Sidebar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              <span className="font-medium" style={{ fontFamily: "serif" }}>Kembali ke Beranda</span>
            </Link>
            
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-6 rounded-lg">
              <AlertTriangle size={48} className="mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Sesi Presensi Tidak Tersedia</h2>
              <p>Tidak ada sesi presensi yang sedang aktif saat ini. Silakan hubungi admin untuk membuka sesi presensi.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Already submitted (baik yang baru submit maupun yang sudah submit sebelumnya)
  if (alreadySubmitted) {
    return (
      <div className="min-h-screen relative">
        <Sidebar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              <span className="font-medium" style={{ fontFamily: "serif" }}>Kembali ke Beranda</span>
            </Link>
            
            <div className="bg-green-100 border border-green-400 text-green-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Presensi Sudah Terkirim</h2>
              <p className="mb-4">Anda sudah mengisi presensi untuk {activeSession.day_title}. Setiap peserta hanya bisa mengisi presensi sekali per sesi.</p>
              
              {/* Status Approval Information */}
              {submissionResult && (
                <div className={`p-4 rounded-lg border-2 mt-4 ${
                  submissionResult.status_approval === 'Disetujui' 
                    ? 'bg-green-100 border-green-600' 
                    : submissionResult.status_approval === 'Pending'
                    ? 'bg-yellow-100 border-yellow-600'
                    : 'bg-red-100 border-red-600'
                }`}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    {submissionResult.status_approval === 'Disetujui' && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {submissionResult.status_approval === 'Pending' && (
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {submissionResult.status_approval === 'Ditolak' && (
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    Status Persetujuan: {submissionResult.status_approval}
                  </h4>
                  <p className="text-sm mb-2">
                    {submissionResult.approval_message}
                  </p>
                  {submissionResult.feedback_admin && (
                    <p className="text-sm italic mt-2">
                      <strong>Feedback Admin:</strong> {submissionResult.feedback_admin}
                    </p>
                  )}
                  {submissionResult.status_approval === 'Pending' && (
                    <p className="text-xs mt-2 italic">
                      💡 Admin akan meninjau presensi Anda. Status akan diupdate setelah ditinjau.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 drop-shadow-lg" style={{ color: "#603017" }}>
            {activeSession.day_title}
          </h1>
          
          <div className="text-center text-lg" style={{ color: "#8B4513", fontFamily: "serif" }}>
            <p className="flex items-center justify-center gap-2 mb-1">
              <Calendar size={18} />
              {getCurrentDate()}
            </p>
            <p className="flex items-center justify-center gap-2 mb-1">
              <Clock size={18} />
              Waktu Saat Ini: {mounted ? getCurrentTime() : "--:--:--"}
            </p>
            {activeSession.auto_close_time && (
              <p className="flex items-center justify-center gap-2 text-orange-700 font-medium">
                <AlertTriangle size={18} />
                Sesi ditutup otomatis: {formatJakartaDateTime(activeSession.auto_close_time)}
              </p>
            )}
          </div>
          
          {/* Session Status */}
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              Sesi Aktif
            </span>
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
                {isSubmitted ? "Presensi Berhasil!" : "Form Presensi"}
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
                      <p><strong>{formData.statusKehadiran === 'Hadir' ? 'Kondisi Kesehatan' : 'Alasan'}:</strong> {formData.alasan}</p>
                      {(formData.statusKehadiran === "Menyusul" || formData.statusKehadiran === "Meninggalkan") && formData.jam && (
                        <p><strong>Jam {formData.statusKehadiran}:</strong> {formData.jam}</p>
                      )}
                      {(formData.statusKehadiran !== "Hadir") && formData.buktiFoto && (
                        <p><strong>Bukti Foto:</strong> {formData.buktiFoto.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Approval Information */}
                  {submissionResult && (
                    <div className={`p-4 rounded-lg border-2 mb-6 ${
                      submissionResult.status_approval === 'Disetujui' 
                        ? 'bg-green-100 border-green-600' 
                        : submissionResult.status_approval === 'Pending'
                        ? 'bg-yellow-100 border-yellow-600'
                        : 'bg-red-100 border-red-600'
                    }`}>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        {submissionResult.status_approval === 'Disetujui' && (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {submissionResult.status_approval === 'Pending' && (
                          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        )}
                        Status Persetujuan
                      </h4>
                      <p className="text-sm mb-2">
                        <strong>Status:</strong> {submissionResult.status_approval}
                      </p>
                      <p className="text-sm">
                        {submissionResult.approval_message}
                      </p>
                      {submissionResult.status_approval === 'Pending' && (
                        <p className="text-xs mt-2 italic">
                          💡 Admin akan meninjau presensi Anda. Status akan diupdate setelah ditinjau.
                        </p>
                      )}
                    </div>
                  )}
                  
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
                        setAlreadySubmitted(false);
                        setSubmissionResult(null);
                        setFormData({
                          statusKehadiran: "",
                          jam: "",
                          alasan: "",
                          buktiFoto: null
                        });
                      }}
                      className="px-6 py-3 rounded-md hover:opacity-90 transition font-medium shadow-lg border-2 border-amber-800 transform hover:scale-105"
                      style={{ 
                        backgroundColor: "transparent",
                        color: "#603017",
                        fontFamily: "serif"
                      }}
                    >
                      Ganti Status Kehadiran
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
                        <option value="Tidak Hadir">Tidak Hadir</option>
                        <option value="Menyusul">Menyusul</option>
                        <option value="Meninggalkan">Meninggalkan</option>
                      </select>
                    </div>

                    {/* Alasan untuk semua status kehadiran */}
                    <div>
                      <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                        color: "#603017",
                        fontFamily: "serif"
                      }}>
                        <User size={18} />
                        {formData.statusKehadiran === 'Hadir' ? 'Kondisi Kesehatan' : `Alasan ${formData.statusKehadiran}`}
                      </label>
                      <textarea
                        name="alasan"
                        value={formData.alasan}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        placeholder={
                          formData.statusKehadiran === 'Hadir' 
                            ? "Jelaskan kondisi kesehatan Anda (contoh: Sehat dan siap mengikuti kegiatan)"
                            : `Jelaskan alasan ${formData.statusKehadiran.toLowerCase()}...`
                        }
                        className="w-full p-3 border-2 border-amber-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
                        style={{ 
                          backgroundColor: "#fef7ed",
                          fontFamily: "serif"
                        }}
                      />
                    </div>

                    {/* Input untuk Tidak Hadir, Menyusul, Meninggalkan */}
                    {(formData.statusKehadiran === "Tidak Hadir" || formData.statusKehadiran === "Menyusul" || formData.statusKehadiran === "Meninggalkan") && (
                      <div className="space-y-4">
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
                              name="jam"
                              value={formData.jam}
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

                        {/* Upload Bukti Foto - hanya untuk non-Hadir */}
                        <div>
                          <label className="flex text-lg font-semibold mb-2 items-center gap-2" style={{ 
                            color: "#603017",
                            fontFamily: "serif"
                          }}>
                            <MapPin size={18} />
                            Bukti Foto
                          </label>
                          <input
                            type="file"
                            name="buktiFoto"
                            onChange={handleInputChange}
                            accept="image/*"
                            required
                            className="w-full p-3 border-2 border-amber-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                            style={{ 
                              backgroundColor: "#fef7ed",
                              fontFamily: "serif"
                            }}
                          />
                          <p className="text-sm mt-1" style={{ 
                            color: "#8B4513",
                            fontFamily: "serif"
                          }}>
                            Upload foto sebagai bukti otentik (format: JPG, PNG, maksimal 5MB)
                          </p>
                          {formData.buktiFoto && (
                            <p className="text-sm mt-2 text-green-600 font-medium">
                              File terpilih: {formData.buktiFoto.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting || isSubmitted}
                      className={`px-8 py-4 rounded-md transition font-medium shadow-lg text-white border-2 border-amber-800 text-lg ${
                        isSubmitting || isSubmitted 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:opacity-90 transform hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: "#603017",
                        fontFamily: "serif",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
                      }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses...
                        </span>
                      ) : isSubmitted ? (
                        'Berhasil Dikirim!'
                      ) : (
                        'Submit presensi'
                      )}
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

export default function AbsensiPage() {
  return (
    <ProtectedRoute>
      <AbsensiContent />
    </ProtectedRoute>
  );
}
