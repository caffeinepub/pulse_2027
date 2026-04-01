import { Toaster } from "@/components/ui/sonner";
import { Activity } from "lucide-react";
import { useState } from "react";
import AnalyticsPage from "./pages/AnalyticsPage";
import TrackerPage from "./pages/TrackerPage";

type Page = "tracker" | "analytics";

export default function App() {
  const [page, setPage] = useState<Page>("tracker");

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: "rgba(10,12,16,0.90)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(138,184,255,0.15)",
                border: "1px solid rgba(138,184,255,0.35)",
              }}
            >
              <Activity size={16} color="#8AB8FF" />
            </div>
            <span
              className="font-bold text-xl tracking-tight"
              style={{ color: "#F3F6FF" }}
            >
              Pulse
            </span>
          </div>

          <nav
            className="flex items-center gap-1 p-1 rounded-full"
            style={{
              background: "rgba(35,40,48,0.7)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
            }}
          >
            <button
              type="button"
              data-ocid="nav.tracker.tab"
              onClick={() => setPage("tracker")}
              className={`pill-tab${page === "tracker" ? " active" : ""}`}
            >
              Tracker
            </button>
            <button
              type="button"
              data-ocid="nav.analytics.tab"
              onClick={() => setPage("analytics")}
              className={`pill-tab${page === "analytics" ? " active" : ""}`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 pb-8 mx-auto w-full max-w-2xl">
        {page === "tracker" ? <TrackerPage /> : <AnalyticsPage />}
      </main>

      <footer className="text-center py-4 text-xs" style={{ color: "#5A616B" }}>
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#8AB8FF" }}
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster
        toastOptions={{
          style: {
            background: "rgba(35,40,48,0.9)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#F3F6FF",
          },
        }}
      />
    </div>
  );
}
