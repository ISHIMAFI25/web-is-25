"use client";

import Sidebar from "@/components/ui/sidebar";
import HomeContent from "@/components/HomeContent";
import AuthGuard from "@/components/auth/AuthGuard";

export default function HomePage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <HomeContent />
        </main>
      </div>
    </AuthGuard>
  );
}
