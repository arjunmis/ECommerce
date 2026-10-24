import { useEffect } from "react";

// Adds the "is-visible" class to every [data-reveal] element as it scrolls into view.
// Re-runs when `deps` change so newly rendered elements are picked up.
export function useReveal(deps = []) {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
