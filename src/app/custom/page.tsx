"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CustomSetlist } from "@/types";

export default function CustomPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [setlists] = useLocalStorage<CustomSetlist[]>("setlists", []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Custom Setlists</h1>
            <Button onClick={() => {/* TODO: Add create setlist functionality */}}>
              Create New Setlist
            </Button>
          </div>
          
          {setlists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {setlists.map((setlist) => (
                <Card key={setlist._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{setlist.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {setlist.songs.length} song(s)
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/custom/${setlist._id}`)}
                      className="w-full"
                    >
                      View Setlist
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">No custom setlists</h2>
              <p className="text-gray-600 mb-6">
                Create your first custom setlist to get started.
              </p>
              <Button onClick={() => {/* TODO: Add create setlist functionality */}}>
                Create Your First Setlist
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}