'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface Day {
  id: string;
  day_number: number;
  title: string;
  description: string;
  date_time: string;
  location: string;
  specifications?: string;
  attachment_files?: {
    name: string;
    url: string;
  }[] | null;
  attachment_links?: {
    name: string;
    url: string;
  }[] | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface DaysSidebarProps {
  isAdmin?: boolean;
}

export default function DaysSidebar({ isAdmin = false }: DaysSidebarProps) {
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🎯 DaysSidebar: Component rendered with isAdmin:', isAdmin);

  useEffect(() => {
    console.log('🚀 DaysSidebar: useEffect triggered, calling fetchDays');
    fetchDays();
  }, [isAdmin]);

  const fetchDays = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/api/admin/days' : '/api/days';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch days');
      }
      
      const data = await response.json();
      console.log('Days API response:', data);
      
      // Handle both formats: array or {days: [...]}
      const daysData = Array.isArray(data) ? data : (data.days || []);
      
      console.log('🚀 DaysSidebar: Raw daysData:', daysData);
      
      // Filter to only show past days (days that have already passed)
      const now = new Date();
      console.log('🔍 DaysSidebar: Current time for filtering:', now.toISOString());
      console.log('🔍 DaysSidebar: Days before filtering:', daysData.map((d: Day) => ({ 
        day_number: d.day_number, 
        date_time: d.date_time,
        isPast: new Date(d.date_time).getTime() < now.getTime()
      })));
      
      const pastDays = daysData.filter((day: Day) => {
        const dayDate = new Date(day.date_time);
        const isPast = dayDate.getTime() < now.getTime();
        console.log(`🔍 Day ${day.day_number}: ${day.date_time} -> isPast: ${isPast}`);
        return isPast; // Only include days that have passed
      });
      
      console.log('✅ DaysSidebar: Past days only:', pastDays.length, pastDays.map((d: Day) => d.day_number));
      setDays(pastDays);
    } catch (err) {
      console.error('Error fetching days:', err);
      setError(err instanceof Error ? err.message : 'Failed to load days');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formatOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    };

    const dateStr = date.toLocaleDateString('id-ID', formatOptions);

    if (diffDays === 0) return `Hari ini, ${dateStr}`;
    if (diffDays === 1) return `Besok, ${dateStr}`;
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} hari lagi, ${dateStr}`;
    if (diffDays < 0) return `${Math.abs(diffDays)} hari lalu, ${dateStr}`;
    
    return dateStr;
  };

  const isUpcoming = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    return date.getTime() > now.getTime();
  };

  const sortedDays = days
    .sort((a, b) => {
      return new Date(a.date_time).getTime() - new Date(b.date_time).getTime();
    });

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar size={18} />
          <span>Day yang Sudah Selesai</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg p-3">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar size={18} />
          <span>Day yang Sudah Selesai</span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div>
        <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar size={18} />
          <span>Day yang Sudah Selesai</span>
        </div>
        <div className="text-gray-500 text-sm bg-gray-50 rounded-lg p-3 text-center">
          Belum ada day yang sudah selesai
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Calendar size={18} />
        <span>Day yang Sudah Selesai</span>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedDays.map((day) => {
          // Skip days with invalid day_number
          if (day.day_number === undefined || day.day_number === null) {
            console.warn('⚠️ DaysSidebar: Skipping day with invalid day_number:', day);
            return null;
          }
          
          return (
          <div key={day.id} className="relative group">
            <Link
              href={`/informasi/day${day.day_number ?? 'error'}`}
              className={`
                block rounded-lg p-3 transition-all duration-200 border
                bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    Day {day.day_number}
                  </h4>
                  {isAdmin && (
                    <div className="flex-shrink-0">
                      {day.is_visible ? (
                        <div title="Visible to participants">
                          <Eye size={12} className="text-green-600" />
                        </div>
                      ) : (
                        <div title="Hidden from participants">
                          <EyeOff size={12} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {((day.attachment_files?.length || 0) > 0 || (day.attachment_links?.length || 0) > 0) && (
                    <div className="text-xs text-blue-600">
                      {(day.attachment_files?.length || 0) + (day.attachment_links?.length || 0)} lampiran
                    </div>
                  )}
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
              
              {/* Indikator day sudah selesai */}
              <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></div>
                Selesai
              </div>
            </Link>

            {/* Hover Tooltip */}
            <div className="absolute left-full top-0 ml-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    Day {day.day_number}: {day.title}
                  </h4>
                </div>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <Clock size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{formatDate(day.date_time)}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{day.location}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-700">
                  <p className="line-clamp-3">{day.description}</p>
                </div>

                {day.specifications && (
                  <div className="text-xs text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">Spesifikasi:</p>
                    <p className="line-clamp-2">{day.specifications}</p>
                  </div>
                )}

                {((day.attachment_files?.length || 0) > 0 || (day.attachment_links?.length || 0) > 0) && (
                  <div className="border-t pt-2">
                    <p className="font-medium text-gray-700 text-xs mb-2">Lampiran:</p>
                    <div className="space-y-1">
                      {day.attachment_files?.map((file: any, index: number) => (
                        <div key={index} className="text-xs text-blue-600 truncate">
                          📄 {file.name}
                        </div>
                      ))}
                      {day.attachment_links?.map((link: any, index: number) => (
                        <div key={index} className="text-xs text-blue-600 truncate">
                          🔗 {link.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Arrow pointing to the day item */}
              <div className="absolute top-4 -left-1 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
            </div>
          </div>
          );
        })}
      </div>
      
      {days.length > 5 && (
        <div className="text-center pt-2 border-t border-gray-200">
          <Link 
            href="/informasi" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Lihat semua day →
          </Link>
        </div>
      )}
    </div>
  );
}
