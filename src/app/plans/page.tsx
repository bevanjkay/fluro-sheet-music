"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/helpers";

export default function PlansPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { services, loadServices, isLoadingServices } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated, loadServices]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {isLoadingServices ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium">Loading services...</h3>
            </div>
          ) : services.length > 0 ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Upcoming Services</h1>
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
                  <strong>Note:</strong> only services with active plans are shown below.
                </div>
              </div>
              
              <div className="space-y-6">
                {services.map((service) => (
                  <Card key={service._id}>
                    {service.mainImage && (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                        <img 
                          src={`https://api.fluro.io/get/${service.mainImage._id}`}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{service.title}</CardTitle>
                      <p className="text-gray-600">{formatDate(service.startDate)}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        {service.plans.map((plan) => (
                          <Button
                            key={plan._id}
                            variant="outline"
                            onClick={() => router.push(`/plans/${plan._id}`)}
                          >
                            {plan.title}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">No services found</h2>
              <p className="text-gray-600">There are no upcoming services with active plans.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}