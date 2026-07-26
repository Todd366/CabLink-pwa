import React, { useEffect } from "react";

export default function LegacyCabLink() {
  useEffect(() => {
    // The legacy CabLink application is already rendered by
    // frontend/index.html. React acts only as the runtime bridge.
    console.log("CABLINK REACT RUNTIME BRIDGE: ACTIVE");
  }, []);

  return null;
}
