"use client";

import { useState, useMemo } from "react";
import {
  Search, ToggleLeft, ToggleRight, AlertTriangle, Edit3, Trash2,
  RefreshCw, Check, Plus, X, CreditCard,
} from "lucide-react";
import { useSubscriptions } from "@/contexts/subscription-context";
import { EditModal } from "@/components/subscription/edit-modal";
import { Badge } from "@/components/subscription/badge";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub, SubStatus } from "@/app/(app)/dashboard/dashboard-types";

function DeleteConfirmModal({
  sub,
  t,
  onConfirm,
  onCancel,
  loading,
}: {
  sub: Sub;
  t: T;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onCancel}
      />
      <div
        style={{
          position: "relative", zIndex: 1,
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 14, padding: 28, maxWidth: 380, width: "90%",
          boxShadow: `0 8px 40px ${t.shadow}`,
          animation: "slideUp 0.18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: t.redDim, border: `1px solid ${t.red}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={14} color={t.red} />
            </div>
            <span id="delete-dialog-title" style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
              Delete Subscription
            </span>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cancel deletion"
            style={{ background: "none", border: "none", cursor: "pointer", color: t.text3, padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.6, marginBottom: 20 }}>
          Delete <strong style={{ color: t.text }}>{sub.name}</strong>? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, background: t.surface2, color: t.text, border: `1px solid ${t.border}`,
              borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 600,
              fontFamily: "var(--font-display)", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, background: t.red, color: "#fff", border: "none",
              borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 700,
              fontFamily: "var(--font-display)", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 7,
            }}
          >
            {loading
              ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Deleting…</>
              : <><Trash2 size={13} /> Delete</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubsView({
  t, subs, setSubs, onAdd, toast,
}: {
  t: T;
  subs: Sub[];
  setSubs: React.Dispatch<React.SetStateAction<Sub[]>>;
  onAdd: () => void;
  toast: (m: string, tp: "success" | "error" | "info") => void;
}) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [sim, setSim]         = useState(false);
  const [editing, setEditing] = useState<Sub | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Sub | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { updateSubscription, deleteSubscription } = useSubscriptions();

  /* ── Memoized filtered list ─────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subs.filter((s) => {
      const m = s.name.toLowerCase().includes(q)
        || s.category.toLowerCase().includes(q)
        || s.provider.toLowerCase().includes(q);
      const f = filter === "all" || s.status === filter;
      return m && f;
    });
  }, [subs, search, filter]);

  const toggleStatus = async (id: string) => {
    const sub = subs.find((s) => s.id === id);
    if (!sub) return;
    const newActive = sub.status !== "active";
    const newStatus: SubStatus = newActive ? "active" : "inactive";
    // Optimistic update
    setSubs((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
    if (sim) return; // simulation mode: no API call
    try {
      await updateSubscription(id, { activeStatus: newActive });
    } catch {
      // Rollback on failure
      setSubs((prev) => prev.map((s) => s.id === id ? { ...s, status: sub.status } : s));
      toast("Failed to update status", "error");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteSubscription(pendingDelete.id);
      setSubs((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      toast("Subscription deleted", "info");
    } catch {
      toast("Failed to delete subscription", "error");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const saveEdit = (updated: Sub) => {
    setSubs((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    setEditing(null);
    toast("Subscription updated", "success");
  };

  const simMonthly  = filtered.filter((s) => s.status === "active").reduce((a, s) => a + s.amount, 0);
  const simInactive = filtered.filter((s) => s.status === "inactive").reduce((a, s) => a + s.amount, 0);

  return (
    <>
      {editing && <EditModal sub={editing} onSave={saveEdit} onClose={() => setEditing(null)} t={t} />}
      {pendingDelete && (
        <DeleteConfirmModal
          sub={pendingDelete}
          t={t}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
          loading={deleting}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>
              My Subscriptions
            </h2>
            <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.5 }}>
              {subs.length} tracked · <span style={{ color: t.green }}>
                ${subs.filter((s) => s.status === "active").reduce((a, s) => a + s.amount, 0).toFixed(2)}/mo
              </span> active
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setSim(!sim)}
              aria-pressed={sim}
              aria-label="Toggle simulation mode"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: sim ? t.greenDim : t.surface2,
                border: `1px solid ${sim ? t.greenBorder : t.border2}`,
                borderRadius: 8, padding: "8px 12px",
                cursor: "pointer", fontSize: 12,
                color: sim ? t.green : t.text2,
                fontFamily: "var(--font-mono)", transition: "all 0.2s",
              }}
            >
              {sim ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} Simulation
            </button>
            <button
              onClick={onAdd}
              aria-label="Add new subscription"
              style={{
                background: t.green, color: "#000", border: "none",
                borderRadius: 8, padding: "8px 16px", cursor: "pointer",
                fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>

        {/* Simulation banner */}
        {sim && (
          <div role="status" style={{ background: t.amberDim, border: `1px solid ${t.amber}44`, borderRadius: 10, padding: "11px 15px", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={14} color={t.amber} aria-hidden="true" />
            <span style={{ fontSize: 12, color: t.amber, fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
              Simulation mode toggle subscriptions to preview budget changes. No real changes are saved.
            </span>
          </div>
        )}

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
            <Search size={13} color={t.text3} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions…"
              aria-label="Search subscriptions"
              style={{
                width: "100%", background: t.surface2, border: `1px solid ${t.border}`,
                borderRadius: 9, padding: "9px 12px 9px 34px",
                fontSize: 13, color: t.text, fontFamily: "var(--font-mono)", outline: "none",
              }}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = t.greenBorder)}
              onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = t.border)}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by status"
            style={{
              background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 9,
              padding: "9px 13px", fontSize: 12, color: t.text,
              fontFamily: "var(--font-mono)", cursor: "pointer", outline: "none",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="warning">Due Soon</option>
            <option value="renewal_passed">Renewal Passed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Empty state */}
        {subs.length === 0 ? (
          <div
            style={{
              background: t.surface, border: `1px dashed ${t.border2}`,
              borderRadius: 12, padding: "56px 24px", textAlign: "center",
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: t.greenDim, border: `1px solid ${t.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CreditCard size={22} color={t.green} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", marginBottom: 8 }}>
              No subscriptions yet
            </div>
            <p style={{ fontSize: 13, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 20, lineHeight: 1.6 }}>
              Add your first subscription to start tracking your spending.
            </p>
            <button
              onClick={onAdd}
              style={{
                background: t.green, color: "#000", border: "none", borderRadius: 9,
                padding: "11px 22px", fontSize: 13, fontWeight: 700,
                fontFamily: "var(--font-display)", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 7,
              }}
            >
              <Plus size={14} /> Add Your First Subscription
            </button>
          </div>
        ) : (
          /* Table */
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}
                role="table"
                aria-label="Subscriptions list"
              >
                <thead>
                  <tr style={{ background: t.surface2 }}>
                    {["", "Name", "Category", "Amount", "Cycle", "Next Renewal", "Auto Renew", "Status", ""].map((h, i) => (
                      <th
                        key={i}
                        scope="col"
                        style={{
                          padding: "10px 14px", textAlign: "left",
                          fontSize: 9.5, color: t.text3,
                          letterSpacing: "0.1em", textTransform: "uppercase",
                          fontFamily: "var(--font-mono)", fontWeight: 600,
                          borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap",
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
                      style={{ borderBottom: `1px solid ${t.border}`, transition: "background 0.12s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = t.surface2)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      {/* Toggle active */}
                      <td style={{ padding: "11px 14px" }}>
                        <button
                          onClick={() => toggleStatus(s.id)}
                          aria-label={`${s.status === "active" ? "Deactivate" : "Activate"} ${s.name}`}
                          aria-pressed={s.status === "active"}
                          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 2 }}
                        >
                          <div
                            style={{
                              width: 18, height: 18, borderRadius: 4,
                              background: s.status === "active" ? t.green : t.surface3,
                              border: `1px solid ${s.status === "active" ? t.green : t.border2}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.18s",
                            }}
                          >
                            {s.status === "active" && <Check size={11} color="#000" strokeWidth={2.5} aria-hidden="true" />}
                          </div>
                        </button>
                      </td>
                      {/* Name */}
                      <td style={{ padding: "11px 14px", maxWidth: 160 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "var(--font-display)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.name}
                        </div>
                        {s.provider && (
                          <div style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 1 }}>
                            {s.provider}
                          </div>
                        )}
                      </td>
                      {/* Category */}
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: 11, color: t.text2, fontFamily: "var(--font-mono)", background: t.surface3, border: `1px solid ${t.border}`, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>
                          {s.category}
                        </span>
                      </td>
                      {/* Amount */}
                      <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                        {s.currency} {s.amount.toFixed(2)}
                      </td>
                      {/* Cycle */}
                      <td style={{ padding: "11px 14px", fontSize: 11, color: t.text2, fontFamily: "var(--font-mono)" }}>
                        {s.cycle}
                      </td>
                      {/* Next renewal */}
                      <td style={{ padding: "11px 14px", fontSize: 11, color: t.text2, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                        {s.nextDate || "-"}
                      </td>
                      {/* Auto renew */}
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: 10, color: s.autoRenew ? t.green : t.text3, fontFamily: "var(--font-mono)" }}>
                          {s.autoRenew ? "Yes" : "No"}
                        </span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: "11px 14px" }}>
                        <Badge status={s.status} t={t} />
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => setEditing(s)}
                            aria-label={`Edit ${s.name}`}
                            style={{ background: "none", border: "none", cursor: "pointer", color: t.text3, padding: 5, borderRadius: 6, transition: "all 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = t.green; (e.currentTarget as HTMLElement).style.background = t.greenDim; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = t.text3; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            <Edit3 size={13} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => setPendingDelete(s)}
                            aria-label={`Delete ${s.name}`}
                            style={{ background: "none", border: "none", cursor: "pointer", color: t.text3, padding: 5, borderRadius: 6, transition: "all 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = t.red; (e.currentTarget as HTMLElement).style.background = t.redDim; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = t.text3; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: "36px 20px", textAlign: "center", color: t.text3, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                {search ? `No results for "${search}"` : "No subscriptions match that filter."}
              </div>
            )}
          </div>
        )}

        {/* Simulation summary */}
        {sim && (
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 22px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", marginBottom: 14 }}>
              Simulation Summary
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
              {[
                { label: "Active Monthly",   value: `$${simMonthly.toFixed(2)}` },
                { label: "Inactive Monthly", value: `$${simInactive.toFixed(2)}` },
                { label: "Annual Savings",   value: `$${(simInactive * 12).toFixed(2)}/yr` },
              ].map((item) => (
                <div key={item.label} style={{ background: t.surface2, borderRadius: 8, padding: "13px 15px" }}>
                  <div style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: t.text }}>
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
