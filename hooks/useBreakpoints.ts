"use client";

import { useEffect, useState } from "react";

export function useBreakpoints() {
  const [breakpoint, setBreakpoint] = useState<string | undefined>(undefined);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setBreakpoint("sm");
      else if (window.innerWidth < 768) setBreakpoint("md");
      else if (window.innerWidth < 1024) setBreakpoint("lg");
      else if (window.innerWidth < 1280) setBreakpoint("xl");
      else setBreakpoint("2xl");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return breakpoint;
}
