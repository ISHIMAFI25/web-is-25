"use client";

import Link from "next/link";
import { AlignJustify, X, Home, Upload, LogOut, UserRoundCheck, User, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      {/* Tombol Menu/Close yang bergeser */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 z-50 p-2 bg-white rounded-md shadow-md hover:bg-gray-50 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "left-60" : "left-4"
        }`}
      >
        {isSidebarOpen ? (
          <X size={24} color="#603017" />
        ) : (
          <AlignJustify size={24} color="#603017" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-45 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Sidebar */}
        <div className="flex flex-col p-4 border-b">
          <h2 className="text-xl font-bold mb-2" style={{ color: "#603017" }}>
            Menu
          </h2>
          {/* User Info */}
          <div className="text-sm" style={{ color: "#603017" }}>
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{username}</span>
              {isAdmin && (
                <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-amber-100 rounded-full">
                  <Shield size={12} />
                  <span className="text-xs">Admin</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          <ul className="space-y-3">
            <li>
              <Link
                href="/"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                onClick={toggleSidebar}
              >
                <Home size={20} color="#603017" />
                <span className="font-medium" style={{ color: "#603017" }}>
                  home
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/tugas"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                onClick={toggleSidebar}
              >
                <Upload size={20} color="#603017" />
                <span className="font-medium" style={{ color: "#603017" }}>
                  Tugas
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/absensi"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                onClick={toggleSidebar}
              >
                <UserRoundCheck size={20} color="#603017" />
                <span className="font-medium" style={{ color: "#603017" }}>
                  Absensi
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/profil"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                onClick={toggleSidebar}
              >
                <User size={20} color="#603017" />
                <span className="font-medium" style={{ color: "#603017" }}>
                  Profil
                </span>
              </Link>
            </li>
            {/* Admin Menu - Hanya tampil jika user adalah admin */}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition border border-amber-300 bg-amber-50"
                  onClick={toggleSidebar}
                >
                  <Shield size={20} color="#603017" />
                  <span className="font-medium" style={{ color: "#603017" }}>
                    Admin Panel
                  </span>
                </Link>
              </li>
            )}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition w-full text-left"
              >
                <LogOut size={20} color="#603017" />
                <span className="font-medium" style={{ color: "#603017" }}>
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
