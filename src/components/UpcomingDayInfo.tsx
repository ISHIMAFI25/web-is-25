'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, File, Eye, UserRoundCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getFileIcon, getFileName } from '@/lib/uploadHelpers';
import Link from "next/link";

interface Day {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  specifications?: string;
  attachmentFiles: (string | { name: string; url: string; size?: number })[];
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UpcomingDayInfo() {
  const [upcomingDay, setUpcomingDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingDay();
  }, []);

  const fetchUpcomingDay = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/days/upcoming');
      
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming day');
      }
      
      const data = await response.json();
      console.log('Upcoming day API response:', data);
      
      // API returns the day directly, not wrapped in {day: ...}
      setUpcomingDay(data);
    } catch (err) {
      console.error('Error fetching upcoming day:', err);
      setError(err instanceof Error ? err.message : 'Failed to load upcoming day');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 text-red-600">
          <div title="Error">
            <Eye size={20} />
          </div>
          <span className="font-medium">Error memuat informasi day</span>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!upcomingDay) {
    return (
      <section className="w-full max-w-2xl mx-auto">
        <Card 
          className="relative border-4 shadow-2xl transform-none"
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
            `,
            transform: "none"
          }}
        >
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold mb-4" style={{ 
              color: "#603017",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              fontFamily: "serif"
            }}>
              Belum ada day yang dijadwalkan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center" style={{ 
            color: "#603017",
            fontFamily: "serif",
            fontSize: "18px"
          }}>
            <p>Informasi day akan muncul di sini ketika tersedia.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full max-w-2xl mx-auto">
      <Card 
        className="relative border-4 shadow-2xl transform-none"
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
          `,
          transform: "none"
        }}
      >
        {/* Gulungan Atas */}
        <div className="absolute -top-4 left-0 right-0 h-8 flex justify-center z-20">
          <div 
            className="w-full h-8 rounded-t-full shadow-lg relative"
            style={{
              background: "linear-gradient(180deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(160,82,45,0.5)"
            }}
          >
            {/* Tekstur kayu gulungan atas */}
            <div 
              className="w-full h-full rounded-t-full opacity-30"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(90deg, 
                    rgba(101,67,33,0.3) 0px, 
                    rgba(101,67,33,0.3) 2px, 
                    transparent 2px, 
                    transparent 4px
                  )
                `
              }}
            ></div>
            
            {/* Bulatan ujung kiri gulungan atas */}
            <div 
              className="absolute -left-4 top-1/2 w-8 h-8 rounded-full shadow-lg transform -translate-y-1/2"
              style={{
                background: "radial-gradient(circle at 30% 30%, #A0522D, #8B4513)",
                boxShadow: "-2px 0 8px rgba(0,0,0,0.4), inset 2px 2px 4px rgba(160,82,45,0.3)"
              }}
            ></div>
            
            {/* Bulatan ujung kanan gulungan atas */}
            <div 
              className="absolute -right-4 top-1/2 w-8 h-8 rounded-full shadow-lg transform -translate-y-1/2"
              style={{
                background: "radial-gradient(circle at 30% 30%, #A0522D, #8B4513)",
                boxShadow: "2px 0 8px rgba(0,0,0,0.4), inset -2px 2px 4px rgba(160,82,45,0.3)"
              }}
            ></div>
            
            {/* Tali pengikat gulungan atas */}
            <div className="absolute top-1/2 left-1/4 w-2 h-6 bg-amber-900 rounded-full transform -translate-y-1/2 opacity-60"></div>
            <div className="absolute top-1/2 right-1/4 w-2 h-6 bg-amber-900 rounded-full transform -translate-y-1/2 opacity-60"></div>
          </div>
        </div>

        {/* Gulungan Bawah */}
        <div className="absolute -bottom-4 left-0 right-0 h-8 flex justify-center z-20">
          <div 
            className="w-full h-8 rounded-b-full shadow-lg relative"
            style={{
              background: "linear-gradient(0deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(160,82,45,0.5)"
            }}
          >
            {/* Tekstur kayu gulungan bawah */}
            <div 
              className="w-full h-full rounded-b-full opacity-30"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(90deg, 
                    rgba(101,67,33,0.3) 0px, 
                    rgba(101,67,33,0.3) 2px, 
                    transparent 2px, 
                    transparent 4px
                  )
                `
              }}
            ></div>
            
            {/* Bulatan ujung kiri gulungan bawah */}
            <div 
              className="absolute -left-4 top-1/2 w-8 h-8 rounded-full shadow-lg transform -translate-y-1/2"
              style={{
                background: "radial-gradient(circle at 30% 30%, #A0522D, #8B4513)",
                boxShadow: "-2px 0 8px rgba(0,0,0,0.4), inset 2px -2px 4px rgba(160,82,45,0.3)"
              }}
            ></div>
            
            {/* Bulatan ujung kanan gulungan bawah */}
            <div 
              className="absolute -right-4 top-1/2 w-8 h-8 rounded-full shadow-lg transform -translate-y-1/2"
              style={{
                background: "radial-gradient(circle at 30% 30%, #A0522D, #8B4513)",
                boxShadow: "2px 0 8px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(160,82,45,0.3)"
              }}
            ></div>
            
            {/* Tali pengikat gulungan bawah */}
            <div className="absolute top-1/2 left-1/4 w-2 h-6 bg-amber-900 rounded-full transform -translate-y-1/2 opacity-60"></div>
            <div className="absolute top-1/2 right-1/4 w-2 h-6 bg-amber-900 rounded-full transform -translate-y-1/2 opacity-60"></div>
          </div>
        </div>

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
            Day ke-{upcomingDay.dayNumber}: {upcomingDay.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-left space-y-6 relative">
          {/* Heavy aged paper effect with multiple layers */}
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
          
          {/* Informasi */}
          <div className="relative z-10">
            <div className="space-y-2" style={{ 
              color: "#603017",
              fontFamily: "serif",
              textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.2)",
              fontSize: "18px"
            }}>
              <p><strong>Deskripsi:</strong> {upcomingDay.description}</p>
              <p><strong>Waktu:</strong> {formatDate(upcomingDay.dateTime)}</p>
              <p><strong>Lokasi:</strong> {upcomingDay.location}</p>
            </div>
          </div>

          {/* Spek */}
          {upcomingDay.specifications && (
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-3 text-left" style={{ 
                color: "#603017",
                fontFamily: "serif",
                textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.2)",
                fontSize: "18px"
              }}>Spek:</h3>
              <div className="whitespace-pre-wrap" style={{ 
                color: "#603017",
                fontFamily: "serif",
                textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.2)",
                fontSize: "18px"
              }}>
                {upcomingDay.specifications}
              </div>
            </div>
          )}

          {/* File Lampiran */}
          {upcomingDay.attachmentFiles && upcomingDay.attachmentFiles.length > 0 && (
            <div className="relative z-10">
              <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ 
                color: "#603017",
                fontFamily: "serif",
                textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.2)",
                fontSize: "18px"
              }}>
                <File size={16} />
                <span>File Lampiran ({upcomingDay.attachmentFiles.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingDay.attachmentFiles.map((file, index) => {
                  // Handle both string format and object format
                  const fileUrl = typeof file === 'string' ? file : file.url;
                  const fileName = typeof file === 'string' 
                    ? getFileName(file) // Use helper to get filename from URL
                    : file.name; // Use the stored name directly
                  
                  return (
                    <a
                      key={index}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors border border-amber-300"
                      style={{
                        color: "#603017",
                        fontFamily: "serif"
                      }}
                    >
                      <span className="text-2xl">{getFileIcon(fileName)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={fileName}>
                          {fileName}
                        </p>
                        <p className="text-xs opacity-75">Klik untuk membuka</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tombol Absen */}
          <div className="flex justify-center pt-4 relative z-10">
            <Link href="/absensi">
              <button 
                className="px-6 py-3 rounded-md hover:opacity-90 transition font-medium flex items-center gap-2 shadow-lg text-white border-2 border-amber-800 transform hover:scale-105"
                style={{ 
                  backgroundColor: "#603017",
                  fontFamily: "serif",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
                }}
              >
                <UserRoundCheck size={20} color="white" />
                Absen Sekarang
              </button>
            </Link>
          </div>

          {/* Footer info */}
          <div className="mt-4 text-xs opacity-60 text-center relative z-10" style={{
            color: "#603017",
            fontFamily: "serif"
          }}>
            <span>
              Terakhir diperbarui: {new Date(upcomingDay.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
