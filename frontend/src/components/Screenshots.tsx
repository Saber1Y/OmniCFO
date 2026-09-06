"use client";

import { motion } from "motion/react";

export function Screenshots() {
  const shots = [
    { src: "/Hero.png", alt: "Landing page hero", label: "Landing" },
    { src: "/Architecture.png", alt: "Architecture diagram", label: "Architecture" },
    { src: "/Overview.png", alt: "Dashboard overview", label: "Overview" },
    { src: "/Policy.png", alt: "Dashboard policy page", label: "Policy" },
  ];

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Screenshots
          </p>
          <h2 className="font-display text-[40px]/[48px] font-medium tracking-tight text-foreground">
            See it in action
          </h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-4"
        >
          {shots.map((shot, i) => (
            <motion.div
              key={shot.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 + i * 0.08 }}
              className="group relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl border border-border bg-card overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <img
                  src={shot.src}
                  alt={shot.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                {/* Overlay label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950/90 to-transparent px-4 py-3">
                  <span className="text-xs font-medium text-stone-100">{shot.label}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}