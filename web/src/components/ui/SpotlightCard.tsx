"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/cn";

export function SpotlightCard({
  children,
  className,
  as: Component = "div",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  return (
    <Component
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "spotlight-card glass-card rounded-3xl transition-all duration-300",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

