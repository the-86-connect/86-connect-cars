"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Image as ImageIcon, Video } from "lucide-react";
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

  return (
    <section className="relative bg-[var(--bg-secondary)] pt-12 pb-24 lg:pt-16 lg:pb-32">
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
                    className="glass-card group relative aspect-[4/3] w-full overflow-hidden rounded-2xl transition-all duration-300 sm:rounded-3xl"
                  >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

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

        {/* Modal for viewing media */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl bg-[var(--bg-card)] shadow-2xl sm:max-w-5xl sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Content */}
                {selectedItem.type === "video" ? (
                  <iframe
                    src={selectedItem.src}
                    title={selectedItem.title}
                    className="aspect-video w-full max-w-3xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    className="max-h-[90vh] w-full object-contain"
                  />
                )}

                {/* Title */}
                <div className="border-t border-[var(--border-color)] bg-[var(--bg-card)] p-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
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
