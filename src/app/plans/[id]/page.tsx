"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useRouter, useParams } from "next/navigation";
import { fetchFluroData } from "@/lib/fluro";
import { Plan, PlanSong } from "@/types";
import { formatDate } from "@/lib/helpers";
import Navigation from "@/components/Navigation";
import PdfWrapper from "@/components/PdfWrapper";

export default function PlanPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { loadSongs, loadSheets, setPlanSongs, getPopulatedSongs } = useData();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadPlan = async () => {
      if (!isAuthenticated || !id || !user.token) return;
      
      try {
        setIsLoadingPlan(true);
        const planData = await fetchFluroData("plan", user, id);
        setPlan(planData);
        
        // Load songs and sheets data
        await Promise.all([loadSongs(), loadSheets()]);
        
        // Filter and set plan songs
        const planSongs: PlanSong[] = planData.schedules.filter(
          (schedule: any) => schedule.type === "song"
        );
        setPlanSongs(planSongs);
        
      } catch (error) {
        console.error("Error loading plan:", error);
      } finally {
        setIsLoadingPlan(false);
      }
    };

    loadPlan();
  }, [isAuthenticated, id, user.token]); // Only depend on specific user properties that matter

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (isLoadingPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium">Loading plan...</h3>
          </div>
        </main>
      </div>
    );
  }

  const populatedSongs = getPopulatedSongs();

  if (populatedSongs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 text-center">
            <h2 className="text-xl font-semibold mb-4">No songs in this plan</h2>
            <p className="text-gray-600 mb-4">
              {plan?.title} • {plan ? formatDate(plan.startDate) : ""}
            </p>
            <button 
              onClick={() => router.push("/plans")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View list of service plans
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <PdfWrapper songs={populatedSongs} />
    </div>
  );
}