'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface UniversalScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  fps?: number;
  qrbox?: number;
}

export default function UniversalScanner({ onScan, onClose, fps = 10, qrbox = 250 }: UniversalScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps, qrbox, rememberLastUsedCamera: true },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        // We don't stop automatically to allow multiple scans (like in inventory)
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [onScan, fps, qrbox]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Camera Scanner</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 font-bold px-2">✕ Close</button>
        </div>
        <div id="reader" className="w-full"></div>
        <div className="p-4 bg-blue-50 text-[10px] text-blue-800 italic text-center">
          Position the QR code or Barcode within the frame.
        </div>
      </div>
    </div>
  );
}
