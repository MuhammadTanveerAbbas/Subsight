"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";
import { buildMonthGrid } from "@/lib/calendar-helpers";
import { exportSubscriptionsICS } from "@/lib/export";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const iso = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function CalendarView({ t, subs }: { t: T; subs: Sub[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const cells = useMemo(
    () => buildMonthGrid(subs, cursor.year, cursor.month),
    [subs, cursor],
  );
  const monthKey = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}`;
  const monthSubs = subs.filter((sub) => sub.nextDate.startsWith(monthKey));

  const upcoming = useMemo(() => {
    const now = iso(today);
    return subs
      .filter((sub) => sub.nextDate >= now)
      .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
      .slice(0, 12);
  }, [subs]);

  const move = (delta: number) => {
    setCursor((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  const title = new Date(cursor.year, cursor.month, 1).toLocaleString("en-US", {
    month: "long", year: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: t.text }}>
            Renewal calendar
          </h2>
          <p style={{ fontSize: 13, color: t.text3, marginTop: 4, fontFamily: "var(--font-display)" }}>
            What renews, and when
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => move(-1)} aria-label="Previous month" style={{ width: 36, height: 36, border: `1px solid ${t.border2}`, borderRadius: 8, background: t.surface2, color: t.text2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })} style={{ border: `1px solid ${t.border}`, borderRadius: 8, background: t.surface2, color: t.text2, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}>
            Today
          </button>
          <button onClick={() => move(1)} aria-label="Next month" style={{ width: 36, height: 36, border: `1px solid ${t.border2}`, borderRadius: 8, background: t.surface2, color: t.text2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => exportSubscriptionsICS(monthSubs)}
            disabled={monthSubs.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 8, border: "none", borderRadius: 8, background: monthSubs.length ? t.green : t.surface2, color: monthSubs.length ? "#000" : t.text3, padding: "8px 12px", fontSize: 13, fontWeight: 500, cursor: monthSubs.length ? "pointer" : "not-allowed" }}
          >
            <Download size={16} strokeWidth={1.5} /> Export month
          </button>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{title}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }} className="cal-layout">
        <div className="cal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", background: t.surface }}>
          {WEEKDAYS.map((day) => (
            <div key={day} style={{ padding: 8, fontSize: 11, color: t.text3, borderBottom: `1px solid ${t.border}`, textAlign: "center" }}>
              {day}
            </div>
          ))}
          {cells.map((cell) => {
            const isToday = cell.date === iso(today);
            return (
              <div
                key={cell.date}
                style={{
                  minHeight: 88,
                  padding: 8,
                  borderRight: `1px solid ${t.border}`,
                  borderBottom: `1px solid ${t.border}`,
                  background: isToday ? "var(--surface2)" : "transparent",
                  opacity: cell.inMonth ? 1 : 0.45,
                  minWidth: 0,
                }}
              >
                <div style={{ fontSize: 11, color: isToday ? t.text : t.text3, marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>
                  {cell.day}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {cell.renewals.slice(0, 2).map((sub) => (
                    <div key={sub.id} style={{ fontSize: 11, color: t.greenInk, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {sub.name}
                    </div>
                  ))}
                  {cell.renewals.length > 2 && (
                    <div style={{ fontSize: 11, color: t.text3 }}>+{cell.renewals.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 12 }}>Next 14 days</div>
          {upcoming.length === 0 ? (
            <div style={{ fontSize: 12, color: t.text3 }}>No renewals ahead</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {upcoming.map((sub) => (
                <div key={sub.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 11, color: t.text3, fontFamily: "var(--font-mono)", width: 52 }}>{sub.nextDate.slice(5)}</span>
                  <span style={{ flex: 1, fontSize: 13, color: t.text }}>{sub.name}</span>
                  <span style={{ fontSize: 12, color: t.text2, fontVariantNumeric: "tabular-nums" }}>{sub.currency} {sub.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
