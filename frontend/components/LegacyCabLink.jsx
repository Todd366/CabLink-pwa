import React from "react";

/*
 * CABLINK — CANONICAL REACT RUNTIME
 *
 * React is now the actual application runtime.
 * The previous implementation returned null and relied on
 * frontend/index.html to render the legacy application.
 *
 * This component provides a visible runtime shell while the
 * canonical ride/API layers remain connected to the existing
 * backend.
 */

export default function LegacyCabLink() {
  return (
    <div
      id="cablink-react-runtime"
      style={{
        minHeight: "100vh",
        width: "100%",
        fontFamily: "system-ui, sans-serif",
        background: "#f5f7fa",
        color: "#111827"
      }}
    >
      <header
        style={{
          padding: "20px",
          background: "#111827",
          color: "#ffffff"
        }}
      >
        <h1 style={{ margin: 0 }}>CabLink</h1>
        <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
          React Runtime Active
        </p>
      </header>

      <main style={{ padding: "24px" }}>
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h2>CabLink Runtime</h2>

          <p>
            The React application is now the active frontend runtime.
          </p>

          <p>
            Canonical ride API:
            <strong> /api/rides</strong>
          </p>

          <div
            id="cablink-runtime-status"
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "8px",
              background: "#eef2ff"
            }}
          >
            Checking backend connection...
          </div>
        </div>
      </main>
    </div>
  );
}
