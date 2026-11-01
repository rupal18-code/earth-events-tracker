"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { COLORS, FALLBACK_COLOR } from "../lib/categories";

// Leaflet needs the browser, so load the map on the client only
const EventMap = dynamic(() => import("./EventMap"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-mist">Loading map…</div>,
});

const RANGES = [7, 30, 90];

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [days, setDays] = useState(30);
  const [hidden, setHidden] = useState(new Set()); // category ids switched off
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch(`/api/events?days=${days}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Request failed"))))
      .then((d) => {
        setEvents(d.events);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [days, retry]);

  const categories = useMemo(() => {
    const counts = {};
    events.forEach((e) => {
      counts[e.categoryId] = counts[e.categoryId] || { title: e.category, n: 0 };
      counts[e.categoryId].n++;
    });
    return Object.entries(counts).sort((a, b) => b[1].n - a[1].n);
  }, [events]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => !hidden.has(e.categoryId) && (!q || e.title.toLowerCase().includes(q)))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [events, hidden, query]);

  const toggle = (id) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const onSelect = useCallback((id) => setSelectedId(id), []);

  return (
    <main className="flex h-screen flex-col md:flex-row">
      <aside className="flex max-h-[55vh] w-full flex-col border-b border-line bg-panel md:max-h-none md:w-[400px] md:border-b-0 md:border-r">
        <header className="p-4 pb-3">
          <h1 className="text-2xl font-bold">Earth Events Tracker</h1>
          <p className="mt-1 text-sm text-mist">
            Open natural events around the world, from NASA's EONET feed.
          </p>

          <div className="mt-3 flex gap-2" role="group" aria-label="Time range">
            {RANGES.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                aria-pressed={days === d}
                className={`rounded-md border px-3 py-1 text-sm ${
                  days === d ? "border-sky-300 bg-sky-300 text-deep" : "border-line text-mist hover:border-mist"
                }`}
              >
                Last {d} days
              </button>
            ))}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events"
            aria-label="Search events"
            className="mt-3 w-full rounded-md border border-line bg-deep px-3 py-2 text-sm placeholder:text-mist"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map(([id, c]) => {
              const on = !hidden.has(id);
              return (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  aria-pressed={on}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                    on ? "border-mist text-white" : "border-line text-mist opacity-60"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: COLORS[id] || FALLBACK_COLOR }}
                  />
                  {c.title} ({c.n})
                </button>
              );
            })}
          </div>
        </header>

        <p className="px-4 pb-2 text-xs text-mist" aria-live="polite">
          {status === "ready" && `${visible.length} of ${events.length} events shown`}
        </p>

        <ul className="flex-1 overflow-y-auto border-t border-line">
          {status === "loading" && <li className="p-4 text-sm text-mist">Loading events from NASA…</li>}

          {status === "error" && (
            <li className="p-4 text-sm">
              <p>Couldn't reach NASA's event feed. Check your connection and try again.</p>
              <button
                onClick={() => setRetry((n) => n + 1)}
                className="mt-2 rounded-md bg-sky-300 px-3 py-1 text-deep"
              >
                Try again
              </button>
            </li>
          )}

          {status === "ready" && visible.length === 0 && (
            <li className="p-4 text-sm text-mist">No events match. Turn on a category or clear the search.</li>
          )}

          {status === "ready" &&
            visible.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => setSelectedId(e.id)}
                  className={`flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left hover:bg-deep ${
                    selectedId === e.id ? "bg-deep" : ""
                  }`}
                >
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: COLORS[e.categoryId] || FALLBACK_COLOR }}
                  />
                  <span>
                    <span className="block text-sm font-medium">{e.title}</span>
                    <span className="block text-xs text-mist">
                      {e.category} · {new Date(e.date).toLocaleDateString()}
                    </span>
                  </span>
                </button>
              </li>
            ))}
        </ul>

        <footer className="border-t border-line px-4 py-2 text-xs text-mist">
          Data: NASA Earth Observatory Natural Event Tracker (EONET)
        </footer>
      </aside>

      <section className="min-h-[300px] flex-1">
        <EventMap events={visible} selectedId={selectedId} onSelect={onSelect} />
      </section>
    </main>
  );
}
