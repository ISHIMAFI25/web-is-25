"use client";

import Link from "next/link";
import { AlignJustify, X, Home, Upload, LogOut, UserRoundCheck, User } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold" style={{ color: "#603017" }}>
            Menu
          </h2>
          {/* Ruang kosong untuk balance karena tombol close sudah di luar */}
          <div className="w-6"></div>
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
            <li>
              <Link
                href="/login"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                onClick={toggleSidebar}
              >
                <LogOut size={20} color="#603017" />
                <span className="font-medium" style={{ color: "#603017" }}>
                  Logout
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
