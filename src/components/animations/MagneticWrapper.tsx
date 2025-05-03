"use client";
import gsap from "gsap";
import React, { useRef, useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function MagneticWrapper({ children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const el = wrapperRef.current;

    const destinationX = gsap.quickTo(el, "x", {
      duration: 2,
      ease: "expo.out"
    });
    const destinationY = gsap.quickTo(el, "y", {
      duration: 2,
      ease: "expo.out"
    });

    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = el.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      destinationX(deltaX * 0.04); // Tune strength here
      destinationY(deltaY * 0.04);
    };

    const mouseLeave = () => {
      destinationX(0);
      destinationY(0);
    };

    window.addEventListener("mousemove", mouseMove);
    el.addEventListener("mouseleave", mouseLeave);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      el.removeEventListener("mouseleave", mouseLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full inline-block will-change-transofmr"
    >
      {children}
    </div>
  );
}
