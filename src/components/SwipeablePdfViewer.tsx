"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Virtual } from "swiper/modules";
import { useAuth } from "@/contexts/AuthContext";
import PdfRender from "./PdfRender";
import { PopulatedSong, Sheet } from "@/types";
import { Button } from "./ui/Button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/virtual";

interface SwipeablePdfViewerProps {
  songs: PopulatedSong[];
}

interface PdfPage {
  songId: string;
  songTitle: string;
  pageNumber: number;
  sheetUrl: string;
  songIndex: number;
  totalPagesInSong: number;
}

export default function SwipeablePdfViewer({ songs }: SwipeablePdfViewerProps) {
  const { user } = useAuth();
  const [allPages, setAllPages] = useState<PdfPage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [songPages, setSongPages] = useState<Record<string, number>>({});
  const [keySelection] = useLocalStorage<Record<string, string | undefined>>("keys", {});
  const swiperRef = useRef<any>(null);

  const createURL = (sheet: Sheet) => {
    return `https://api.fluro.io/get/${sheet._id}?access_token=${user.token}`;
  };

  const handlePdfData = (data: { id: string; numPages: number }) => {
    setSongPages(prev => {
      const updated = {
        ...prev,
        [data.id]: data.numPages
      };
      
      // Check if we have page counts for all songs to build the pages array
      const allSongsHavePageCount = songs.every(song => updated[song._id]);
      if (allSongsHavePageCount) {
        buildAllPages(updated);
      }
      
      return updated;
    });
  };

  const buildAllPages = (pageData: Record<string, number>) => {
    const pages: PdfPage[] = [];
    let preloadCount = 0;
    const totalSongs = songs.length;

    songs.forEach((song, songIndex) => {
      const selectedKey = keySelection[song._id];
      const selectedSheet = selectedKey 
        ? song.data.sheetMusic?.find(sheet => sheet.data?.key === selectedKey)
        : song.data.sheetMusic?.[0];

      if (selectedSheet) {
        const numPages = pageData[song._id] || 1;
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          pages.push({
            songId: song._id,
            songTitle: song.title,
            pageNumber: pageNum,
            sheetUrl: createURL(selectedSheet),
            songIndex,
            totalPagesInSong: numPages,
          });
        }
      }
      
      preloadCount++;
      setPreloadProgress((preloadCount / totalSongs) * 100);
    });

    setAllPages(pages);
    setIsPreloading(false);
  };

  // Preload all PDFs to get page counts
  useEffect(() => {
    if (songs.length > 0) {
      setIsPreloading(true);
      setPreloadProgress(0);
    }
  }, [songs]);

  const jumpToNextSong = useCallback(() => {
    if (!swiperRef.current || allPages.length === 0) return;
    
    const currentPage = allPages[currentSlide];
    if (!currentPage) return;
    
    const nextSongIndex = currentPage.songIndex + 1;
    const nextSongFirstPage = allPages.findIndex(page => page.songIndex === nextSongIndex);
    
    if (nextSongFirstPage !== -1) {
      swiperRef.current.slideTo(nextSongFirstPage);
    }
  }, [allPages, currentSlide]);

  const jumpToPrevSong = useCallback(() => {
    if (!swiperRef.current || allPages.length === 0) return;
    
    const currentPage = allPages[currentSlide];
    if (!currentPage) return;
    
    const prevSongIndex = currentPage.songIndex - 1;
    const prevSongFirstPage = allPages.findIndex(page => page.songIndex === prevSongIndex);
    
    if (prevSongFirstPage !== -1) {
      swiperRef.current.slideTo(prevSongFirstPage);
    }
  }, [allPages, currentSlide]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!swiperRef.current) return;
      
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          swiperRef.current.slideNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          swiperRef.current.slidePrev();
          break;
        case "ArrowDown":
          e.preventDefault();
          // Jump to next song
          jumpToNextSong();
          break;
        case "ArrowUp":
          e.preventDefault();
          // Jump to previous song
          jumpToPrevSong();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [jumpToNextSong, jumpToPrevSong]);

  const jumpToSong = (songIndex: number) => {
    if (!swiperRef.current || allPages.length === 0) return;
    
    const firstPageOfSong = allPages.findIndex(page => page.songIndex === songIndex);
    if (firstPageOfSong !== -1) {
      swiperRef.current.slideTo(firstPageOfSong);
    }
  };

  if (songs.length === 0) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold mb-4">No songs in this plan.</h2>
        <Button onClick={() => window.location.href = "/plans"}>
          View list of service plans
        </Button>
      </div>
    );
  }

  if (isPreloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Preloading sheet music...</h3>
          <p className="text-gray-600 mb-4">
            Preparing all PDFs for immediate access during your performance.
          </p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${preloadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{Math.round(preloadProgress)}% complete</p>
          
          {/* Hidden PDF renders for preloading */}
          <div className="hidden">
            {songs.map((song) => {
              const selectedKey = keySelection[song._id];
              const selectedSheet = selectedKey 
                ? song.data.sheetMusic?.find(sheet => sheet.data?.key === selectedKey)
                : song.data.sheetMusic?.[0];

              if (!selectedSheet) return null;

              return (
                <PdfRender
                  key={song._id}
                  source={createURL(selectedSheet)}
                  page={1}
                  song={song._id}
                  onData={handlePdfData}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (allPages.length === 0) {
    return (
      <div className="p-12 text-center min-h-screen pt-24">
        <h1 className="text-2xl font-bold mb-2">No sheet music available</h1>
        <h3 className="text-red-600">No sheet music found for any songs in this plan.</h3>
      </div>
    );
  }

  const currentPage = allPages[currentSlide];
  const totalPages = allPages.length;
  const currentSong = songs[currentPage?.songIndex];

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Navigation Controls */}
      <div className="fixed top-20 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={jumpToPrevSong} 
              disabled={currentPage?.songIndex === 0}
            >
              ← Prev Song
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => swiperRef.current?.slidePrev()} 
              disabled={currentSlide === 0}
            >
              ← Prev
            </Button>
          </div>
          
          <div className="text-center flex-1 mx-4">
            <div className="font-semibold text-lg">{currentPage?.songTitle}</div>
            <div className="text-sm text-gray-600">
              Song {(currentPage?.songIndex || 0) + 1} of {songs.length} • 
              Page {currentPage?.pageNumber} of {currentPage?.totalPagesInSong} • 
              Overall {currentSlide + 1} of {totalPages}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => swiperRef.current?.slideNext()} 
              disabled={currentSlide === totalPages - 1}
            >
              Next →
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={jumpToNextSong} 
              disabled={currentPage?.songIndex === songs.length - 1}
            >
              Next Song →
            </Button>
          </div>
        </div>
        
        {/* Song selector */}
        <div className="flex justify-center mt-3 space-x-1 overflow-x-auto pb-2">
          {songs.map((song, index) => (
            <button
              key={song._id}
              onClick={() => jumpToSong(index)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                currentPage?.songIndex === index
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {song.title}
            </button>
          ))}
        </div>
      </div>

      {/* PDF Swiper */}
      <div className="pt-40 pb-8">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setCurrentSlide(swiper.activeIndex);
          }}
          modules={[Navigation, Keyboard, Virtual]}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          keyboard={{
            enabled: true,
            onlyInViewport: true,
          }}
          virtual={{
            enabled: true,
            slides: allPages,
          }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          className="h-full"
          style={{ 
            height: "calc(100vh - 200px)",
            paddingBottom: "2rem"
          }}
        >
          {allPages.map((page, index) => (
            <SwiperSlide key={`${page.songId}-${page.pageNumber}`} virtualIndex={index}>
              <div className="flex justify-center items-start h-full">
                <PdfRender
                  source={page.sheetUrl}
                  page={page.pageNumber}
                  song={page.songId}
                  onData={handlePdfData}
                />
              </div>
            </SwiperSlide>
          ))}
          
          {/* Custom navigation buttons */}
          <div className="swiper-button-prev !hidden"></div>
          <div className="swiper-button-next !hidden"></div>
        </Swiper>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 right-4 z-10">
        <div className="bg-black/70 text-white text-sm rounded-lg p-3 text-center max-w-2xl mx-auto">
          <p>
            <span className="font-medium">Swipe</span> or use <span className="font-medium">arrow keys</span> to navigate • 
            <span className="font-medium"> ↑↓</span> for songs • 
            <span className="font-medium"> ←→</span> for pages • 
            <span className="font-medium"> Space</span> for next page
          </p>
        </div>
      </div>
    </div>
  );
}