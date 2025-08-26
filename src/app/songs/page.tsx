"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SongsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { songs, loadSongs, isLoadingSongs } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSongs();
    }
  }, [isAuthenticated, loadSongs]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold mb-8">Songs Library</h1>
          
          {isLoadingSongs ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium">Loading songs...</h3>
            </div>
          ) : songs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song) => (
                <Card key={song._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{song.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Key: {song.data?.key || "Unknown"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {song.data?.firstLine || "No preview available"}
                    </p>
                    {song.data?.sheetMusic && (
                      <p className="text-xs text-gray-500 mt-2">
                        {song.data.sheetMusic.length} sheet(s) available
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">No songs found</h2>
              <p className="text-gray-600">No songs are available in your library.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}