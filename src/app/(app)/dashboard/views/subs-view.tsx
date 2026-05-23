"use client";

import { useState } from "react";
import {
  Search, ToggleLeft, ToggleRight, AlertTriangle, Edit3, Trash2,
  RefreshCw, Check, Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EditModal } from "@/components/subscription/edit-modal";
import { Badge } from "@/components/subscription/badge";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub, SubStatus } from "@/app/(app)/dashboard/dashboard-types";

export function SubsView({
  t,
  subs,
  setSubs,
  onAdd,
  toast,
}: {
  t: T;
  subs: Sub[];
  setSubs: React.Dispatch<React.SetStateAction<Sub[]>>;
  onAdd: () => void;
  toast: (m: string, tp: "success" | "error" | "info") => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sim, setSim] = useState(false);
  const [editing, setEditing] = useState<Sub | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = subs.filter((s) => {
    const q = search.toLowerCase();
    const m =
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.provider.toLowerCase().includes(q);
    const f = filter === "all" || s.status === filter;
    return m && f;
  });

  const toggleStatus = async (id: string) => {
    const sub = subs.find((s) => s.id === id);
    if (!sub) return;
    const newStatus: SubStatus =
      sub.status === "active" ? "inactive" : "active";
    try {
      const supabase = createClient();
      await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("id", id);
      setSubs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
      );
    } catch {
      toast("Failed to update status", "error");
    }
  };

  const deleteSub = async (id: string) => {
    setDeleting(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setSubs((prev) => prev.filter((s) => s.id !== id));
      toast("Subscription deleted", "info");
    } catch {
      toast("Failed to delete subscription", "error");
    } finally {
      setDeleting(null);
    }
  };

  const saveEdit = (updated: Sub) => {
    setSubs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditing(null);
    toast("Subscription updated", "success");
  };

  const simMonthly = filtered
    .filter((s) => s.status === "active")
    .reduce((a, s) => a + s.amount, 0);
  const simInactive = filtered
    .filter((s) => s.status === "inactive")
    .reduce((a, s) => a + s.amount, 0);

  return (
    <>
      {editing && (
        <EditModal
          sub={editing}
          onSave={saveEdit}
          onClose={() => setEditing(null)}
          t={t}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 800,
                color: t.text,
                letterSpacing: -0.5,
              }}
            >
              My Subscriptions
            </h2>
            <p
              style={{
                fontSize: 11.5,
                color: t.text3,
                fontFamily: "var(--font-mono)",
                marginTop: 3,
              }}
            >
              {subs.length} tracked · $
              {subs
                .filter((s) => s.status === "active")
                .reduce((a, s) => a + s.amount, 0)
                .toFixed(2)}
              /mo active
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setSim(!sim)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: sim ? t.greenDim : t.surface2,
                border: `1px solid ${sim ? t.greenBorder : t.border2}`,
                borderRadius: 8,
                padding: "9px 13px",
                cursor: "pointer",
                fontSize: 12,
                color: sim ? t.green : t.text2,
                fontFamily: "var(--font-mono)",
                transition: "all 0.2s",
              }}
            >
              {sim ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}{" "}
              Simulation
            </button>
            <button
              onClick={onAdd}
              style={{
                background: t.green,
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "9px 16px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>

        {sim && (
          <div
            style={{
              background: t.amberDim,
              border: `1px solid ${t.amber}44`,
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <AlertTriangle size={14} color={t.amber} />
            <span
              style={{
                fontSize: 12,
                color: t.amber,
                fontFamily: "var(--font-mono)",
              }}
            >
              Simulation active toggle subscriptions to preview budget changes.
              No real changes are saved.
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search
              size={13}
              color={t.text3}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, or provider…"
              style={{
                width: "100%",
                background: t.surface2,
                border: `1px solid ${t.border}`,
                borderRadius: 9,
                padding: "9px 12px 9px 34px",
                fontSize: 13,
                color: t.text,
                fontFamily: "var(--font-mono)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                ((e.target as HTMLInputElement).style.borderColor =
                  t.greenBorder)
              }
              onBlur={(e) =>
                ((e.target as HTMLInputElement).style.borderColor = t.border)
              }
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              background: t.surface2,
              border: `1px solid ${t.border}`,
              borderRadius: 9,
              padding: "9px 13px",
              fontSize: 12,
              color: t.text,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="warning">Due Soon</option>
            <option value="renewal_passed">Renewal Passed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 720,
              }}
            >
              <thead>
                <tr style={{ background: t.surface2 }}>
                  {[
                    "Active",
                    "Name",
                    "Category",
                    "Amount",
                    "Cycle",
                    "Renewal Date",
                    "Auto Renew",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 9.5,
                        color: t.text3,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 400,
                        borderBottom: `1px solid ${t.border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: `1px solid ${t.border}`,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        t.surface2)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "transparent")
                    }
                  >
                    <td style={{ padding: "11px 14px" }}>
                      <button
                        onClick={() => !sim && toggleStatus(s.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: sim ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            background:
                              s.status === "active" ? t.green : t.surface3,
                            border: `1px solid ${s.status === "active" ? t.green : t.border2}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                          }}
                        >
                          {s.status === "active" && (
                            <Check size={11} color="#000" strokeWidth={2.5} />
                          )}
                        </div>
                      </button>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: t.text,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {s.name}
                      </div>
                      {s.provider && (
                        <div
                          style={{
                            fontSize: 10,
                            color: t.text3,
                            fontFamily: "var(--font-mono)",
                            marginTop: 1,
                          }}
                        >
                          {s.provider}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: t.text2,
                          fontFamily: "var(--font-mono)",
                          background: t.surface3,
                          border: `1px solid ${t.border}`,
                          borderRadius: 4,
                          padding: "2px 7px",
                        }}
                      >
                        {s.category}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "11px 14px",
                        fontSize: 13,
                        fontWeight: 700,
                        color: t.text,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.currency} {s.amount.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "11px 14px",
                        fontSize: 11,
                        color: t.text2,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.cycle}
                    </td>
                    <td
                      style={{
                        padding: "11px 14px",
                        fontSize: 11,
                        color: t.text2,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.nextDate || ""}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          color: s.autoRenew ? t.green : t.text3,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {s.autoRenew ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <Badge status={s.status} t={t} />
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          onClick={() => setEditing(s)}
                          title="Edit"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: t.text3,
                            padding: "4px",
                            borderRadius: 5,
                            transition: "color 0.2s, background 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color =
                              t.green;
                            (e.currentTarget as HTMLElement).style.background =
                              t.greenDim;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color =
                              t.text3;
                            (e.currentTarget as HTMLElement).style.background =
                              "transparent";
                          }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => deleteSub(s.id)}
                          disabled={deleting === s.id}
                          title="Delete"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: t.text3,
                            padding: "4px",
                            borderRadius: 5,
                            transition: "color 0.2s, background 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color =
                              t.red;
                            (e.currentTarget as HTMLElement).style.background =
                              t.redDim;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color =
                              t.text3;
                            (e.currentTarget as HTMLElement).style.background =
                              "transparent";
                          }}
                        >
                          {deleting === s.id ? (
                            <RefreshCw
                              size={13}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div
              style={{
                padding: "44px 20px",
                textAlign: "center",
                color: t.text3,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
              }}
            >
              {subs.length === 0
                ? "No subscriptions yet."
                : `No subscriptions found${search ? ` for "${search}"` : ""}.`}
            </div>
          )}
        </div>

        {sim && (
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: t.text,
                fontFamily: "var(--font-display)",
                marginBottom: 14,
              }}
            >
              Simulation Summary
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                gap: 12,
              }}
            >
              {[
                { label: "Active Monthly", value: `$${simMonthly.toFixed(2)}` },
                {
                  label: "Inactive Monthly",
                  value: `$${simInactive.toFixed(2)}`,
                },
                {
                  label: "Annual Savings",
                  value: `$${(simInactive * 12).toFixed(2)}/yr`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: t.surface2,
                    borderRadius: 8,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: t.text3,
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 6,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 20,
                      fontWeight: 800,
                      color: t.text,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
