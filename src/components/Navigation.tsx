"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Fluro Sheet Music
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                Home
              </Link>
              <Link href="/plans" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                Service Plans
              </Link>
              <Link href="/songs" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                Songs
              </Link>
              <Link href="/custom" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                Custom Setlists
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user.firstName && (
              <span className="text-gray-700">Hello, {user.firstName}</span>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}