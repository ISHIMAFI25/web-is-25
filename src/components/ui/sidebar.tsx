"use client";

import Link from "next/link";
import { AlignJustify, X, Home, Upload, LogOut, UserRoundCheck, User, Shield, Calendar, Info } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInformasiDayHovered, setIsInformasiDayHovered] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Ambil username dari metadata atau email
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  return (
    <>
      {/* Tombol Menu/Close yang responsif */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-3 md:top-4 z-50 p-2 md:p-3 bg-white rounded-md shadow-md hover:bg-gray-50 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "left-52 md:left-60" : "left-3 md:left-4"
        }`}
      >
        {isSidebarOpen ? (
          <X size={20} className="md:w-6 md:h-6" color="#603017" />
        ) : (
          <AlignJustify size={20} className="md:w-6 md:h-6" color="#603017" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-56 md:w-64 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Sidebar */}
        <div className="flex flex-col p-3 md:p-4 border-b">
          <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: "#603017" }}>
            Menu
          </h2>
          {/* User Info */}
          <div className="text-xs md:text-sm" style={{ color: "#603017" }}>
            <div className="flex items-center gap-2">
              <User size={14} className="md:w-4 md:h-4" />
              <span className="truncate">{username}</span>
              {isAdmin && (
                <div className="flex items-center gap-1 ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-amber-100 rounded-full">
                  <Shield size={10} className="md:w-3 md:h-3" />
                  <span className="text-xs">Admin</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-3 md:p-4">
          <ul className="space-y-2 md:space-y-3">
            <li>
              <Link
                href="/"
                className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg hover:bg-gray-100 transition"
                onClick={toggleSidebar}
              >
                <Home size={18} className="md:w-5 md:h-5" color="#603017" />
                <span className="font-medium text-sm md:text-base" style={{ color: "#603017" }}>
                  home
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/tugas"
                className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg hover:bg-gray-100 transition"
                onClick={toggleSidebar}
              >
                <Upload size={18} className="md:w-5 md:h-5" color="#603017" />
                <span className="font-medium text-sm md:text-base" style={{ color: "#603017" }}>
                  Tugas
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/absensi"
                className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg hover:bg-gray-100 transition"
                onClick={toggleSidebar}
              >
                <UserRoundCheck size={18} className="md:w-5 md:h-5" color="#603017" />
                <span className="font-medium text-sm md:text-base" style={{ color: "#603017" }}>
                  Absensi
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/profil"
                className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg hover:bg-gray-100 transition"
                onClick={toggleSidebar}
              >
                <User size={18} className="md:w-5 md:h-5" color="#603017" />
                <span className="font-medium text-sm md:text-base" style={{ color: "#603017" }}>
                  Profil
                </span>
              </Link>
            </li>
            
            {/* Informasi Day Menu dengan Hover Submenu */}
            <li 
              className="relative"
              onMouseEnter={() => setIsInformasiDayHovered(true)}
              onMouseLeave={() => setIsInformasiDayHovered(false)}
            >
              <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <Calendar size={18} className="md:w-5 md:h-5" color="#603017" />
                <span className="font-medium text-sm md:text-base" style={{ color: "#603017" }}>
                  Informasi Day
                </span>
                <svg 
                  className={`ml-auto w-3 h-3 md:w-4 md:h-4 transition-transform ${isInformasiDayHovered ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="#603017" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Submenu Day - Expand ke bawah */}
              {isInformasiDayHovered && (
                <div className="ml-4 md:ml-6 mt-2 space-y-1 transition-all duration-200 ease-in-out">
                  <Link
                    href="/informasi/day0"
                    className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-100 transition bg-gray-50 border-l-2 border-amber-300"
                    onClick={toggleSidebar}
                  >
                    <Info size={14} className="md:w-4 md:h-4" color="#603017" />
                    <span className="text-xs md:text-sm font-medium" style={{ color: "#603017" }}>
                      Day 0
                    </span>
                  </Link>
                </div>
              )}
            </li>
            {/* Admin Menu - Hanya tampil jika user adalah admin */}
            {isAdmin && (
              <>
                <li>
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg hover:bg-gray-100 transition border border-amber-300 bg-amber-50"
                    onClick={toggleSidebar}
                  >
                    <Shield size={18} className="md:w-5 md:h-5" color="#603017" />
                    <span className="font-medium text-sm md:text-base" style={{ color: "#603017" }}>
                      Admin Panel
                    </span>
                  </Link>
                </li>
              </>
            )}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg hover:bg-gray-100 transition w-full text-left"
              >
                <LogOut size={18} className="md:w-5 md:h-5" color="#603017" />
                <span className="font-medium text-sm md:text-base" style={{ color: "#603017" }}>
                  Logout
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
