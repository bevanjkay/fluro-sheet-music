"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PdfRender from "./PdfRender";
import { PopulatedSong, Sheet } from "@/types";
import { Button } from "./ui/Button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface PdfWrapperProps {
  songs: PopulatedSong[];
}

export default function PdfWrapper({ songs }: PdfWrapperProps) {
  const { user } = useAuth();
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [songPages, setSongPages] = useState<Record<string, number>>({});
  const [keySelection] = useLocalStorage<Record<string, string | undefined>>("keys", {});
  const [vertical] = useLocalStorage<boolean>("vertical", false);

  const currentSong = songs[currentSongIndex];

  const createURL = (sheet: Sheet) => {
    return `https://api.fluro.io/get/${sheet._id}?access_token=${user.token}`;
  };

  const handleData = (data: { id: string; numPages: number }) => {
    setSongPages(prev => ({
      ...prev,
      [data.id]: data.numPages
    }));
  };

  const nextPage = () => {
    const maxPages = songPages[currentSong._id] || 1;
    if (currentPage < maxPages) {
      setCurrentPage(currentPage + 1);
    } else if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setCurrentPage(1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      const prevSong = songs[currentSongIndex - 1];
      setCurrentPage(songPages[prevSong._id] || 1);
    }
  };

  const nextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setCurrentPage(1);
    }
  };

  const prevSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          nextPage();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevPage();
          break;
        case "ArrowDown":
          e.preventDefault();
          nextSong();
          break;
        case "ArrowUp":
          e.preventDefault();
          prevSong();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, currentSongIndex, songPages]);

  if (!currentSong) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold mb-4">No songs in this plan.</h2>
        <Button onClick={() => window.location.href = "/plans"}>
          View list of service plans
        </Button>
      </div>
    );
  }

  // Find the selected sheet for the current song
  const selectedKey = keySelection[currentSong._id];
  const selectedSheet = selectedKey 
    ? currentSong.data.sheetMusic?.find(sheet => sheet.data?.key === selectedKey)
    : currentSong.data.sheetMusic?.[0];

  if (!selectedSheet) {
    return (
      <div className="p-12 text-center min-h-screen pt-24">
        <h1 className="text-2xl font-bold mb-2">{currentSong.title}</h1>
        <h3 className="text-red-600">No sheet music for this song.</h3>
      </div>
    );
  }

  const totalPages = songPages[currentSong._id] || 1;

  return (
    <div className="relative">
      {/* Navigation Controls */}
      <div className="fixed top-20 left-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={prevSong} disabled={currentSongIndex === 0}>
              ← Prev Song
            </Button>
            <Button variant="outline" onClick={prevPage} disabled={currentSongIndex === 0 && currentPage === 1}>
              ← Prev Page
            </Button>
          </div>
          
          <div className="text-center">
            <div className="font-semibold">{currentSong.title}</div>
            <div className="text-sm text-gray-600">
              Song {currentSongIndex + 1} of {songs.length} • Page {currentPage} of {totalPages}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={nextPage} 
              disabled={currentSongIndex === songs.length - 1 && currentPage === totalPages}
            >
              Next Page →
            </Button>
            <Button variant="outline" onClick={nextSong} disabled={currentSongIndex === songs.length - 1}>
              Next Song →
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="pt-32 pb-8">
        <PdfRender
          source={createURL(selectedSheet)}
          page={currentPage}
          song={currentSong._id}
          onData={handleData}
        />
      </div>
    </div>
  );
}