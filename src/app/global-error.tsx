"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f3faf7",
          color: "#14312c",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.75rem" }}>Something went wrong</h1>
          <p style={{ color: "#3d5c55" }}>
            Please try again. If this keeps happening, refresh the page or come
            back shortly.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              border: 0,
              borderRadius: 999,
              padding: "0.85rem 1.4rem",
              background: "#0f766e",
              color: "white",
              fontWeight: 650,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
