"use client";

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, Calendar, User as UserIcon } from "lucide-react";
import { formatJakartaDateTime } from '@/lib/timezoneUtils';
import { extractUserFullName } from '@/lib/userUtils';

// Simple Badge component inline
interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  children: React.ReactNode;
}

function Badge({ variant = "default", className = "", children }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-500",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-500",
    outline: "text-gray-900 border-gray-300 hover:bg-gray-50",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface UserSubmission {
  id: number;
  session_id: number;
  day_number: number;
  day_title: string;
  status_kehadiran: string;
  jam_menyusul_meninggalkan: string | null;
  alasan: string | null;
  foto_url: string | null;
  status_approval: 'Disetujui' | 'Pending' | 'Ditolak';
  feedback_admin: string | null;
  created_at: string;
  updated_at: string;
}

interface UserSubmissionStatusProps {
  userEmail: string;
  user?: User; // Now properly typed with Supabase User type
  showTitle?: boolean;
  maxItems?: number;
}

export default function UserSubmissionStatus({ 
  userEmail, 
  user,
  showTitle = true, 
  maxItems = 5 
}: UserSubmissionStatusProps) {
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (!userEmail) return;

    // Set nama user menggunakan extractUserFullName jika user object tersedia
    if (user) {
      const fullName = extractUserFullName(user);
      setUserName(fullName);
    } else {
      // Fallback ke username dari email jika user object tidak tersedia
      const emailUsername = userEmail.split('@')[0];
      const formattedName = emailUsername
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setUserName(formattedName);
    }

    const fetchUserSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/attendance-data/user-submissions?userEmail=${encodeURIComponent(userEmail)}&limit=${maxItems}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user submissions');
        }

        const data = await response.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error('Error fetching user submissions:', err);
        setError('Gagal memuat data presensi');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubmissions();
  }, [userEmail, user, maxItems]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return (
          <Badge variant="default" className="bg-green-500 text-green-800 border-green-300 text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case 'Ditolak':
        return (
          <Badge variant="destructive" className="bg-red-500 text-red-800 border-red-300 text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
      case 'Pending':
      default:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getKehadiranBadge = (status: string) => {
    switch (status) {
      case 'Hadir':
        return <Badge variant="outline" className="text-green-800 border-green-600 bg-green-50 text-xs px-2 py-0.5">Hadir</Badge>;
      case 'Tidak Hadir':
        return <Badge variant="outline" className="text-red-800 border-red-600 bg-red-50 text-xs px-2 py-0.5">Tidak Hadir</Badge>;
      case 'Menyusul':
        return <Badge variant="outline" className="text-blue-800 border-blue-600 bg-blue-50 text-xs px-2 py-0.5">Menyusul</Badge>;
      case 'Meninggalkan':
        return <Badge variant="outline" className="text-orange-800 border-orange-600 bg-orange-50 text-xs px-2 py-0.5">Meninggalkan</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-800 border-amber-600 bg-amber-50 text-xs px-2 py-0.5">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="mb-6 border-4 border-amber-800 shadow-lg" 
            style={{ backgroundColor: "#f4e4bc" }}>
        <CardHeader className="border-b border-amber-700/30" 
                    style={{ backgroundColor: "rgba(139, 69, 19, 0.1)" }}>
          {showTitle && (
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2" 
                         style={{ color: "#603017", fontFamily: "serif" }}>
                <FileText className="w-5 h-5" style={{ color: "#8B4513" }} />
                Riwayat Status Presensi
              </CardTitle>
              {userName && (
                <p className="text-sm mt-1 flex items-center gap-1" 
                   style={{ color: "#8B4513", fontFamily: "serif" }}>
                  <UserIcon className="w-4 h-4" />
                  {userName}
                </p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent style={{ backgroundColor: "rgba(244, 228, 188, 0.9)" }}>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" 
                 style={{ borderColor: "#8B4513" }}></div>
            <span className="ml-3" style={{ color: "#654321" }}>Memuat data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-4 border-amber-800 shadow-lg" 
            style={{ backgroundColor: "#f4e4bc" }}>
        <CardHeader className="border-b border-amber-700/30" 
                    style={{ backgroundColor: "rgba(139, 69, 19, 0.1)" }}>
          {showTitle && (
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2" 
                         style={{ color: "#603017", fontFamily: "serif" }}>
                <FileText className="w-5 h-5" style={{ color: "#8B4513" }} />
                Riwayat Status Presensi
              </CardTitle>
              {userName && (
                <p className="text-sm mt-1 flex items-center gap-1" 
                   style={{ color: "#8B4513", fontFamily: "serif" }}>
                  <UserIcon className="w-4 h-4" />
                  {userName}
                </p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent style={{ backgroundColor: "rgba(244, 228, 188, 0.9)" }}>
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#B91C1C" }} />
            <p style={{ color: "#B91C1C" }}>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card className="mb-6 border-4 border-amber-800 shadow-lg" 
            style={{ backgroundColor: "#f4e4bc" }}>
        <CardHeader className="border-b border-amber-700/30" 
                    style={{ backgroundColor: "rgba(139, 69, 19, 0.1)" }}>
          {showTitle && (
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2" 
                         style={{ color: "#603017", fontFamily: "serif" }}>
                <FileText className="w-5 h-5" style={{ color: "#8B4513" }} />
                Riwayat Status Presensi
              </CardTitle>
              {userName && (
                <p className="text-sm mt-1 flex items-center gap-1" 
                   style={{ color: "#8B4513", fontFamily: "serif" }}>
                  <UserIcon className="w-4 h-4" />
                  {userName}
                </p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent style={{ backgroundColor: "rgba(244, 228, 188, 0.9)" }}>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: "#A0522D" }} />
            <p style={{ color: "#8B4513" }}>Belum ada data presensi</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-4 border-amber-800 shadow-lg" 
          style={{ 
            backgroundColor: "#f4e4bc",
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(101, 67, 33, 0.1) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(101, 67, 33, 0.08) 2px, transparent 2px),
              linear-gradient(45deg, rgba(139, 69, 19, 0.02) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(139, 69, 19, 0.02) 25%, transparent 25%)
            `,
            backgroundSize: "30px 30px, 25px 25px, 40px 40px, 40px 40px"
          }}>
      <CardHeader className="border-b border-amber-700/30 pb-3" 
                  style={{ backgroundColor: "rgba(139, 69, 19, 0.1)" }}>
        {showTitle && (
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2" 
                       style={{ color: "#603017", fontFamily: "serif" }}>
              <FileText className="w-5 h-5" style={{ color: "#8B4513" }} />
              Riwayat Status Presensi
            </CardTitle>
            {userName && (
              <p className="text-sm mt-1 flex items-center gap-1" 
                 style={{ color: "#8B4513", fontFamily: "serif" }}>
                <UserIcon className="w-4 h-4" />
                {userName}
              </p>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4" style={{ backgroundColor: "rgba(244, 228, 188, 0.9)" }}>
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div 
              key={submission.id} 
              className="border-2 border-amber-700/40 rounded-lg p-3 hover:bg-amber-50/80 transition-colors shadow-sm"
              style={{ 
                backgroundColor: "rgba(254, 247, 237, 0.9)",
                borderColor: "#8B4513"
              }}
            >
              {/* Header dengan Day dan Status */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm" 
                      style={{ color: "#603017", fontFamily: "serif" }}>
                  Day {submission.day_number}: {submission.day_title}
                </span>
                {getStatusBadge(submission.status_approval)}
              </div>

              {/* Info singkat */}
              <div className="flex items-center gap-4 text-sm mb-2" 
                   style={{ color: "#8B4513" }}>
                <div className="flex items-center gap-1">
                  {getKehadiranBadge(submission.status_kehadiran)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" style={{ color: "#A0522D" }} />
                  <span className="text-xs" style={{ color: "#8B4513" }}>
                    {(() => {
                      // Untuk status Menyusul dan Meninggalkan, tampilkan jam_menyusul_meninggalkan
                      if ((submission.status_kehadiran === 'Menyusul' || submission.status_kehadiran === 'Meninggalkan') 
                          && submission.jam_menyusul_meninggalkan 
                          && submission.jam_menyusul_meninggalkan !== 'null' 
                          && submission.jam_menyusul_meninggalkan !== '') {
                        
                        // jam_menyusul_meninggalkan adalah TIME format (HH:MM:SS)
                        // Jadi kita tampilkan langsung sebagai jam saja
                        return `${submission.jam_menyusul_meninggalkan.substring(0, 5)}`; // Ambil HH:MM saja
                      } else {
                        // Untuk status lain, gunakan created_at dengan format lengkap
                        const formatted = formatJakartaDateTime(submission.created_at);
                        return formatted === 'Invalid Date' ? 'Submit: Waktu tidak valid' : `Submit: ${formatted}`;
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* Alasan jika ada */}
              {submission.alasan && (
                <div className="text-sm mb-2" style={{ color: "#654321" }}>
                  <span style={{ color: "#8B4513" }}>
                    {submission.status_kehadiran === 'Hadir' ? 'Kondisi kesehatan:' : 'Alasan:'}
                  </span> {submission.alasan}
                </div>
              )}

              {/* Feedback admin jika ada */}
              {submission.feedback_admin && (
                <div className="border-l-4 p-2 text-sm" 
                     style={{ 
                       backgroundColor: "#f4e4bc", 
                       borderLeftColor: "#8B4513" 
                     }}>
                  <span className="font-medium" style={{ color: "#603017" }}>Feedback Admin:</span>
                  <span className="ml-1" style={{ color: "#654321" }}>{submission.feedback_admin}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
