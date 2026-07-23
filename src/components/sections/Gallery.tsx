"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Image as ImageIcon, Video, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { stagger, viewportOnce, EASE } from "@/lib/motion";

type MediaType = "all" | "photo" | "video";

type MediaItem = {
  id: string;
  type: "photo" | "video";
  src: string;
  thumbnail: string;
  title: string;
};

function extractYouTubeId(src: string): string | null {
  const match = src.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getYouTubeThumbUrls(id: string): string[] {
  return [
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/0.jpg`,
    `/api/youtube-thumb?id=${id}`,
  ];
}

function VideoThumb({ item }: { item: MediaItem }) {
  const ytId = extractYouTubeId(item.src);
  const thumbUrls = ytId ? getYouTubeThumbUrls(ytId) : [item.thumbnail || item.src];
  const [imgSrc, setImgSrc] = useState(thumbUrls[0]);
  const [errored, setErrored] = useState(false);

  const handleError = useCallback(() => {
    const idx = thumbUrls.indexOf(imgSrc);
    if (idx >= 0 && idx < thumbUrls.length - 1) {
      setImgSrc(thumbUrls[idx + 1]);
    } else {
      setErrored(true);
    }
  }, [imgSrc, thumbUrls]);

  return (
    <>
      {!errored ? (
        <img
          src={imgSrc}
          alt={item.title}
          onError={handleError}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-full w-full scale-105 object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
          <Video className="h-12 w-12 text-white/30 sm:h-16 sm:w-16" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/90 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14">
          <svg className="ml-0.5 h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </>
  );
}

export function Gallery() {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<MediaType>("all");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Fetch gallery items from admin-managed DB on mount.
  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMediaItems(
            data.map((item) => ({
              id: String(item.id),
              type: item.type === "video" ? "video" : "photo",
              src: String(item.src ?? ""),
              thumbnail: String(item.thumbnail ?? item.src ?? ""),
              title: String(item.title ?? ""),
            })),
          );
        }
      })
      .catch((err) => console.error("Gallery fetch error:", err));
  }, []);

  const filteredItems = activeTab === "all"
    ? mediaItems
    : mediaItems.filter((item) => item.type === activeTab);

  useEffect(() => {
    if (!selectedItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedItem]);

  return (
    <section id="gallery" className="relative bg-[var(--bg-secondary)] pt-12 pb-24 lg:pt-16 lg:pb-32">
      <div className="mx-auto max-w-[1400px] px-2">
        {/* Section heading */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex flex-col items-center text-center"
        >
          <SectionHeading
            eyebrow="Our Gallery"
            title="See Our Work in Action"
            subtitle="Explore a selection of vehicles available for export from China."
          />
        </motion.div>

        {/* Tab bar */}
        <div className="mt-8 flex justify-center sm:mt-10">
          <div className="inline-flex rounded-full bg-[var(--bg-elevated)] p-1">
            {(["all", "photo", "video"] as MediaType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 sm:px-4 sm:py-2 sm:text-sm ${
                  activeTab === tab
                    ? "bg-brand-500 text-white shadow-lg"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab === "all" ? (
                  <>
                    <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </>
                ) : tab === "photo" ? (
                  <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
                {tab === "all" ? "All" : tab === "photo" ? "Photos" : "Videos"}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery grid — 2 cols mobile, 3 tablet, 4 desktop */}
        <div className="mt-8 sm:mt-12">
          <motion.div
            layout
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.length === 0 ? (
                <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-[var(--border-color)] py-16 text-sm text-[var(--text-muted)] col-span-full">
                  {mediaItems.length === 0
                    ? "Gallery is empty — add photos and videos from the admin panel."
                    : "No items in this category."}
                </div>
              ) : (
                filteredItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
                    onClick={() => setSelectedItem(item)}
                    className="glass-card group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900 transition-all duration-300 sm:rounded-3xl"
                  >
                      {item.type === "video" ? (
                        <VideoThumb item={item} />
                      ) : (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      )}

                      {/* Overlay — dark only at the bottom for title legibility, top stays clean */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.45)_25%,transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Type badge */}
                      <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                        <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                          {item.type === "photo" ? (
                            <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                          {item.type === "photo" ? "Photo" : "Video"}
                        </div>
                      </div>

                      {/* Title on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-6">
                        <p className="text-sm font-semibold text-white sm:text-lg">{item.title}</p>
                      </div>
                    </motion.button>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
        </div>

        {/* Browse All Media button */}
        {mediaItems.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-600 hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Browse All Media
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Modal for viewing media */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-2 sm:p-4"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={`relative w-full overflow-hidden rounded-xl shadow-2xl sm:rounded-2xl ${
                  selectedItem.type === "video"
                    ? "max-w-[90vw] sm:max-w-[900px]"
                    : "max-w-[90vw] bg-[var(--bg-card)] sm:max-w-5xl"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80 sm:right-4 sm:top-4"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Content */}
                {selectedItem.type === "video" ? (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={selectedItem.src}
                      title={selectedItem.title}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    className="max-h-[85vh] w-full object-contain"
                  />
                )}

                {/* Title */}
                <div className="border-t border-[var(--border-color)] bg-[var(--bg-card)] p-3 sm:p-4">
                  <h3 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                    {selectedItem.title}
                  </h3>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
