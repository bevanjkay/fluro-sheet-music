"use client";

import React, { createContext, useContext, useState } from "react";
import { Song, Sheet, Service, Plan, PlanSong, PopulatedSong } from "@/types";
import { useAuth } from "./AuthContext";
import { fetchFluroData } from "@/lib/fluro";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface DataContextType {
  // Songs
  songs: Song[];
  sheets: Sheet[];
  services: Service[];
  planSongs: PlanSong[];
  
  // Actions
  loadSongs: () => Promise<void>;
  loadSheets: () => Promise<void>;
  loadServices: () => Promise<void>;
  setPlanSongs: (songs: PlanSong[]) => void;
  
  // Computed
  getPopulatedSongs: () => PopulatedSong[];
  
  // Loading states
  isLoadingSongs: boolean;
  isLoadingSheets: boolean;
  isLoadingServices: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [songs, setSongs] = useLocalStorage<Song[]>("songs", []);
  const [sheets, setSheets] = useLocalStorage<Sheet[]>("sheets", []);
  const [services, setServices] = useLocalStorage<Service[]>("services", []);
  const [songsExpiry, setSongsExpiry] = useLocalStorage<number>("songsExpiry", 0);
  const [sheetsExpiry, setSheetsExpiry] = useLocalStorage<number>("sheetsExpiry", 0);
  const [servicesExpiry, setServicesExpiry] = useLocalStorage<number>("servicesExpiry", 0);
  const [planSongs, setPlanSongs] = useState<PlanSong[]>([]);
  
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const loadSongs = async () => {
    if (songsExpiry > Date.now() && songs.length > 0) {
      return; // Use cached data
    }
    
    setIsLoadingSongs(true);
    try {
      const data = await fetchFluroData("song", user);
      setSongs(data);
      setSongsExpiry(Date.now() + 5 * 60 * 1000); // 5 minutes cache
    } catch (error) {
      console.error("Error loading songs:", error);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  const loadSheets = async () => {
    if (sheetsExpiry > Date.now() && sheets.length > 0) {
      return; // Use cached data
    }
    
    setIsLoadingSheets(true);
    try {
      const data = await fetchFluroData("sheet", user);
      setSheets(data);
      setSheetsExpiry(Date.now() + 5 * 60 * 1000); // 5 minutes cache
    } catch (error) {
      console.error("Error loading sheets:", error);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const loadServices = async () => {
    if (servicesExpiry > Date.now() && services.length > 0) {
      return; // Use cached data
    }
    
    setIsLoadingServices(true);
    try {
      const data = await fetchFluroData("service", user);
      setServices(data);
      setServicesExpiry(Date.now() + 5 * 60 * 1000); // 5 minutes cache
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const getPopulatedSongs = (): PopulatedSong[] => {
    const populated: PopulatedSong[] = [];

    planSongs.forEach((planSong: PlanSong) => {
      const matchedSong = songs.find((s: Song) => s._id === planSong._id);
      if (!matchedSong) {
        return;
      }

      const populatedSong: PopulatedSong = {
        ...matchedSong,
        pages: [1],
        sheetMusic: matchedSong.data?.sheetMusic || [],
        selectedSheet: matchedSong.data?.sheetMusic?.[0],
      };

      populated.push(populatedSong);
    });

    return populated;
  };

  const value = {
    songs,
    sheets,
    services,
    planSongs,
    loadSongs,
    loadSheets,
    loadServices,
    setPlanSongs,
    getPopulatedSongs,
    isLoadingSongs,
    isLoadingSheets,
    isLoadingServices,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}