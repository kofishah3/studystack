import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";


function Lightbox({
  media,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  media: { type: "image" | "video"; url: string }[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const current = media[index];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="absolute -top-9 left-0 text-xs text-white/50 font-medium select-none">
          {index + 1} / {media.length}
        </span>

        <button
          onClick={onClose}
          className="absolute -top-9 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X size={22} />
        </button>

        <div className="w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[78vh]">
          {current.type === "image" ? (
            <img
              src={current.url}
              alt=""
              className="max-h-[78vh] max-w-full object-contain"
            />
          ) : (
            <video
              src={current.url}
              className="max-h-[78vh] max-w-full"
              controls
              autoPlay
            />
          )}
        </div>

        {media.length > 1 && (
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={onPrev}
              disabled={index === 0}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1.5">
              {media.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all ${
                    i === index ? "w-4 h-2 bg-white" : "w-2 h-2 bg-white/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onNext}
              disabled={index === media.length - 1}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function MediaCarousel({
  mediaURLs,
}: {
  mediaURLs: { type: "image" | "video"; url: string }[];
}) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (mediaURLs.length === 0) return null;

  const item = mediaURLs[current];

  return (
    <>
      <div className="mt-2 w-full flex flex-col gap-2">
        <div
          className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group"
          style={{ height: item.type === "video" ? "380px" : "260px" }}
          onClick={
            item.type === "image" ? () => setLightboxOpen(true) : undefined
          }
        >
          {item.type === "image" ? (
            <img
              src={item.url}
              alt=""
              className="w-full object-contain cursor-pointer"
            />
          ) : (
            <video
              src={item.url}
              className="w-full h-full object-contain"
              controls
            />
          )}

          {item.type === "video" && (
            <span className="absolute top-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-md font-medium pointer-events-none">
              Video
            </span>
          )}

          {mediaURLs.length > 1 && (
            <span className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-md font-medium pointer-events-none">
              {current + 1} / {mediaURLs.length}
            </span>
          )}
        </div>

        {mediaURLs.length > 1 && (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setCurrent((i) => Math.max(i - 1, 0))}
              disabled={current === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous file"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            <div className="flex items-center gap-1.5">
              {mediaURLs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to file ${i + 1}`}
                  className={`rounded-full transition-all ${
                    i === current
                      ? "w-4 h-2 bg-primary-500"
                      : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setCurrent((i) => Math.min(i + 1, mediaURLs.length - 1))
              }
              disabled={current === mediaURLs.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next file"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          media={mediaURLs}
          index={current}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setCurrent((i) => Math.max(i - 1, 0))}
          onNext={() =>
            setCurrent((i) => Math.min(i + 1, mediaURLs.length - 1))
          }
        />
      )}
    </>
  );
}