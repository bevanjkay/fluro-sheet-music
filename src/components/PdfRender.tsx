"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker - use CDN version for better compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfRenderProps {
  source: string | ArrayBuffer;
  page?: number;
  song: string;
  onData?: (data: { id: string; numPages: number }) => void;
}

export default function PdfRender({ source, page = 1, song, onData }: PdfRenderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (onData) {
      onData({ id: song, numPages });
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading sheet music</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Document
        file={source}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading sheet music...</p>
            </div>
          </div>
        }
      >
        <Page 
          pageNumber={page} 
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="max-w-full"
        />
      </Document>
    </div>
  );
}