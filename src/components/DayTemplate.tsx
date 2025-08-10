"use client";

import { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Clock, File, Eye, Compass, ScrollText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFileIcon, getFileName } from '@/lib/uploadHelpers';
import Sidebar from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

// Interface untuk attachment files
interface AttachmentFile {
  url: string;
  name: string;
  size?: number;
}

// Interface untuk attachment links
interface AttachmentLink {
  url: string;
  title: string;
  description?: string;
}

interface Day {
  id: string;
  day_number: number;
  title: string;
  description: string;
  date_time: string;
  location: string;
  specifications?: string;
  attachment_files: AttachmentFile[];
  attachment_links?: AttachmentLink[];
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface DayPageProps {
  dayNumber: number;
}

export default function DayPage({ dayNumber }: DayPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dayData, setDayData] = useState<Day | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect ke login jika belum login
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user) {
      fetchDayData();
    }
  }, [user, loading, router, dayNumber]);

  const fetchDayData = useCallback(async () => {
    try {
      console.log('🔍 DayTemplate: Starting fetch for day number:', dayNumber);
      setDataLoading(true);
      const response = await fetch('/api/days');
      
      if (!response.ok) {
        throw new Error('Failed to fetch days data');
      }
      
      const data = await response.json();
      console.log('🔍 DayTemplate: Days API response:', data);
      
      // API returns array directly, not { days: [...] }
      const targetDay = Array.isArray(data) 
        ? data.find((day: Day) => day.day_number === dayNumber)
        : data.days?.find((day: Day) => day.day_number === dayNumber);
      
      console.log('🔍 DayTemplate: Looking for day number:', dayNumber);
      console.log('🔍 DayTemplate: Found day:', targetDay);
      setDayData(targetDay || null);
    } catch (err) {
      console.error('Error fetching day data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load day data');
    } finally {
      setDataLoading(false);
    }
  }, [dayNumber]);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    } else if (!loading && user) {
      fetchDayData();
    }
  }, [user, loading, router, fetchDayData]);

  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  // Show loading state while checking auth
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: "#603017" }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen relative">
        <Sidebar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Eye size={20} />
              <span className="font-medium">Error memuat informasi Day {dayNumber}</span>
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!dayData) {
    return (
      <div className="min-h-screen relative">
        <Sidebar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md">
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <Calendar size={20} />
              <span className="font-medium">Day {dayNumber} Belum Tersedia</span>
            </div>
            <p className="text-yellow-600">Informasi Day {dayNumber} belum diatur oleh admin.</p>
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        {/* Judul Web */}
        <h1 className="text-6xl font-extrabold mb-8 drop-shadow-lg" style={{ color: "#603017" }}>
          IS 2025
        </h1>

        {/* Kolom Informasi Day */}
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
          {/* Gulungan Atas */}
          <div className="absolute -top-4 left-0 right-0 h-8 flex justify-center z-20">
            <div 
              className="w-full h-8 rounded-t-full shadow-lg relative"
              style={{
                background: "linear-gradient(180deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)",
                border: "2px solid #654321",
                borderBottom: "none",
              }}
            >
              {/* Tali gulungan */}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-700 rounded-full"></div>
            </div>
          </div>

          {/* Gulungan Bawah */}
          <div className="absolute -bottom-4 left-0 right-0 h-8 flex justify-center z-20">
            <div 
              className="w-full h-8 rounded-b-full shadow-lg relative"
              style={{
                background: "linear-gradient(0deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)",
                border: "2px solid #654321",
                borderTop: "none",
              }}
            >
              {/* Tali gulungan */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-700 rounded-full"></div>
            </div>
          </div>

          {/* Content */}
          <CardHeader className="text-center relative z-10 pt-8">
            <CardTitle 
              className="text-3xl font-bold mb-2"
              style={{ 
                color: "#603017",
                fontFamily: "serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
              }}
            >
              📅 Day {dayData.day_number}: {dayData.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-8 pb-8 relative z-10">
            <div className="space-y-6 text-left">
              {/* Informasi Waktu dan Tempat */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg shadow-sm">
                  <Clock size={20} className="text-amber-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-800">Waktu:</div>
                    <div className="text-gray-700">{formatDate(dayData.date_time)}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg shadow-sm">
                  <MapPin size={20} className="text-amber-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-800">Tempat:</div>
                    <div className="text-gray-700">{dayData.location}</div>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="p-4 bg-white/70 rounded-lg shadow-sm">
                <h4 className="font-semibold text-amber-800 mb-2">Deskripsi:</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{dayData.description}</p>
              </div>

              {/* Spesifikasi */}
              {dayData.specifications && (
                <div className="p-4 bg-white/70 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-amber-800 mb-2">Spesifikasi & Persiapan:</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{dayData.specifications}</p>
                </div>
              )}

              {/* File Attachments */}
              {dayData.attachment_files.length > 0 && (
                <div className="p-4 bg-white/70 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <File size={18} />
                    File Lampiran:
                  </h4>
                  <div className="space-y-2">
                    {dayData.attachment_files.map((file: AttachmentFile, index: number) => {
                      const fileName = typeof file === 'string' ? getFileName(file) : file.name;
                      const fileUrl = typeof file === 'string' ? file : file.url;
                      const fileSize = typeof file === 'object' && file.size 
                        ? ` (${(file.size / 1024 / 1024).toFixed(1)} MB)` 
                        : '';

                      return (
                        <a
                          key={index}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all duration-200 group"
                        >
                          <div className="text-blue-600 flex-shrink-0">
                            {getFileIcon(fileName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-blue-800 truncate group-hover:text-blue-900">
                              {fileName}
                            </div>
                            {fileSize && (
                              <div className="text-xs text-blue-600">{fileSize}</div>
                            )}
                          </div>
                          <ExternalLink size={16} className="text-blue-500 flex-shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Link Attachments */}
              {dayData.attachment_links && dayData.attachment_links.length > 0 && (
                <div className="p-4 bg-white/70 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <ExternalLink size={18} />
                    Link Lampiran:
                  </h4>
                  <div className="space-y-2">
                    {dayData.attachment_links.map((link: AttachmentLink, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-all duration-200 group"
                      >
                        <div className="text-green-600 flex-shrink-0">
                          <ExternalLink size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-green-800 truncate group-hover:text-green-900">
                            {link.title}
                          </div>
                          <div className="text-xs text-green-600 truncate">{link.url}</div>
                        </div>
                        <ExternalLink size={16} className="text-green-500 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="text-center pt-4">
                <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-medium">
                    🎯 Siap untuk memulai Day {dayData.day_number}?
                  </p>
                  <p className="text-amber-700 text-sm mt-1">
                    Pastikan Anda sudah mempersiapkan semua yang diperlukan!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </section>
      </div>
    </div>
  );
}
