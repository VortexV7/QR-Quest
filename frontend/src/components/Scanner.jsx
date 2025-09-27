import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export default function Scanner({ start, onDecode }) {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    if (!start) return;

    codeReaderRef.current = new BrowserMultiFormatReader();
    const codeReader = codeReaderRef.current;

    const videoElem = videoRef.current;

    if (!videoElem) return;

    let active = true;

    codeReader
      .decodeFromVideoDevice(null, videoElem, (result, err) => {
        if (!active) return;
        if (result) {
          onDecode(result.text);
        } else if (err && !(err instanceof NotFoundException)) {
          console.error("QR Scan Error:", err);
        }
      })
      .catch((err) => console.error("Failed to start scanner:", err));

    return () => {
      active = false;
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (e) {
          console.warn("Scanner reset failed:", e.message);
        }
        codeReaderRef.current = null;
      }
    };
  }, [start, onDecode]);

  return (
    <div className="flex justify-center items-center w-full">
      <video
        ref={videoRef}
        className="w-full max-w-md rounded shadow-lg border"
        muted
        autoPlay
      />
    </div>
  );
}
