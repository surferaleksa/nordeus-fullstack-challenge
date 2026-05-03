"use client";

export default function Home() {
  return (
    <div
      className="main-screen"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at top, #1a1a1a, #000)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          letterSpacing: "4px",
          marginBottom: "10px",
          textShadow: "0 0 20px rgba(255,255,255,0.15)",
        }}
      >
        NORDEUS CHALLENGE 2026
      </h1>

      <p style={{ opacity: 0.6, marginBottom: "40px", fontSize: "14px" }}>
        A turn-based RPG game
      </p>

      <a
        href="/map"
        style={{
          padding: "14px 28px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #2b2b2b, #111)",
          border: "1px solid #444",
          color: "white",
          textDecoration: "none",
          fontWeight: 600,
          letterSpacing: "1px",
          transition: "0.2s ease",
          boxShadow: "0 0 20px rgba(255,255,255,0.05)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 0 25px rgba(255,255,255,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.05)";
        }}
      >
        ▶ Start Run
      </a>
    </div>
  );
}