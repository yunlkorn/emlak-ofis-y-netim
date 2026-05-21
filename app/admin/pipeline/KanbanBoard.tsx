"use client";
import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { User, MapPin, TrendingUp, Clock } from "lucide-react";
import type { Lead, LeadStage } from "@/lib/schema";
import { STAGE_LABELS } from "@/lib/schema";

interface Column {
  stage: LeadStage;
  label: string;
  leads: Lead[];
  totalBudget: number;
}

interface Props {
  columns: Column[];
  brokerMap: Record<string, string>;
}

const STAGE_COLORS: Record<LeadStage, { bg: string; text: string; bar: string }> = {
  yeni:              { bg: "var(--stage-yeni-bg)",        text: "var(--stage-yeni)",        bar: "oklch(56% 0.18 240)" },
  iletisime_gecildi: { bg: "var(--stage-iletisime-bg)",   text: "var(--stage-iletisime)",   bar: "oklch(50% 0.16 200)" },
  gorusme:           { bg: "var(--stage-gorusme-bg)",     text: "var(--stage-gorusme)",     bar: "oklch(58% 0.18 72)" },
  teklif:            { bg: "var(--stage-teklif-bg)",      text: "var(--stage-teklif)",      bar: "oklch(58% 0.20 45)" },
  sozlesme:          { bg: "var(--stage-sozlesme-bg)",    text: "var(--stage-sozlesme)",    bar: "oklch(54% 0.20 290)" },
  kapandi:           { bg: "var(--stage-kapandi-bg)",     text: "var(--stage-kapandi)",     bar: "oklch(54% 0.14 142)" },
  kaybedildi:        { bg: "var(--stage-kaybedildi-bg)",  text: "var(--stage-kaybedildi)",  bar: "oklch(52% 0.22 22)" },
};

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K ₺`;
  return `${n.toLocaleString("tr-TR")} ₺`;
}

function staleDays(lead: Lead): number {
  const ref = lead.lastContactedAt ?? lead.createdAt;
  return Math.floor((Date.now() - new Date(ref).getTime()) / 86_400_000);
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 71 ? "score-high" : score >= 41 ? "score-mid" : "score-low";
  return (
    <span className={`stage-badge ${cls}`} style={{ fontSize: "10px", padding: "1px 6px" }}>
      {score}
    </span>
  );
}

function KanbanCard({
  lead,
  brokerMap,
  index,
}: {
  lead: Lead;
  brokerMap: Record<string, string>;
  index: number;
}) {
  const days = staleDays(lead);
  const borderStyle =
    days >= 14
      ? "2px solid var(--c-danger)"
      : days >= 7
      ? "2px solid var(--c-warning)"
      : "1px solid var(--c-border)";

  const brokerName = lead.assignedBrokerId ? brokerMap[lead.assignedBrokerId] : null;

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="admin-card p-3 cursor-grab active:cursor-grabbing select-none"
          style={{
            border: borderStyle,
            boxShadow: snapshot.isDragging ? "var(--shadow-lg)" : "var(--shadow-sm)",
            transform: snapshot.isDragging ? "rotate(2deg)" : undefined,
            transition: snapshot.isDragging ? undefined : "box-shadow 120ms, border-color 120ms",
            ...provided.draggableProps.style,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              href={`/admin/leads/${lead.id}`}
              className="font-semibold text-sm leading-tight hover:underline"
              style={{ color: "var(--c-text)", fontFamily: "var(--font-display)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {lead.fullName}
            </Link>
            <ScoreBadge score={lead.score ?? 0} />
          </div>

          {/* Meta */}
          <div className="space-y-1">
            {lead.budgetMax && (
              <div className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "var(--c-brand)" }}>
                <TrendingUp size={11} />
                {parseInt(lead.budgetMax).toLocaleString("tr-TR")} ₺
              </div>
            )}
            {lead.district && (
              <div className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--c-text-muted)" }}>
                <MapPin size={11} />
                {lead.district}
              </div>
            )}
            {brokerName && (
              <div className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--c-text-subtle)" }}>
                <User size={11} />
                {brokerName}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2"
            style={{ borderTop: "1px solid var(--c-border)" }}>
            <span className="text-xs" style={{ color: "var(--c-text-subtle)" }}>
              {new Date(lead.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
            </span>
            {days > 0 && (
              <span
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: days >= 14 ? "var(--c-danger)" : days >= 7 ? "var(--c-warning)" : "var(--c-text-subtle)" }}
              >
                <Clock size={10} />
                {days}g
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanBoard({ columns: initialColumns, brokerMap }: Props) {
  const [columns, setColumns] = useState(initialColumns);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStage      = source.droppableId as LeadStage;
    const destinationStage = destination.droppableId as LeadStage;

    // Optimistic update
    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, leads: [...col.leads] }));
      const srcCol  = next.find((c) => c.stage === sourceStage)!;
      const dstCol  = next.find((c) => c.stage === destinationStage)!;
      const [moved] = srcCol.leads.splice(source.index, 1);
      dstCol.leads.splice(destination.index, 0, { ...moved, stage: destinationStage });
      // Recalculate totals
      srcCol.totalBudget = srcCol.leads.reduce((s, l) => s + (parseFloat(l.budgetMax ?? "0") || 0), 0);
      dstCol.totalBudget = dstCol.leads.reduce((s, l) => s + (parseFloat(l.budgetMax ?? "0") || 0), 0);
      return next;
    });

    if (sourceStage !== destinationStage) {
      try {
        await fetch(`/api/leads/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: destinationStage }),
        });
      } catch {
        // Revert on error
        setColumns(initialColumns);
      }
    }
  }, [initialColumns]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6" style={{ minHeight: "calc(100vh - 200px)" }}>
        {columns.map((col) => {
          const colors = STAGE_COLORS[col.stage];
          return (
            <div
              key={col.stage}
              className="shrink-0 flex flex-col rounded-2xl"
              style={{
                width: 280,
                background: "var(--c-surface-2)",
                border: "1px solid var(--c-border)",
              }}
            >
              {/* Column header */}
              <div className="p-3 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: colors.bar }} />
                    <span className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--c-text-2)", fontFamily: "var(--font-display)" }}>
                      {col.label}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {col.leads.length}
                  </span>
                </div>
                {col.totalBudget > 0 && (
                  <p className="text-xs font-semibold pl-4" style={{ color: "var(--c-text-muted)" }}>
                    {formatTL(col.totalBudget)}
                  </p>
                )}
              </div>

              {/* Thin color bar */}
              <div className="mx-3 h-0.5 rounded-full mb-2" style={{ background: colors.bar, opacity: 0.4 }} />

              {/* Cards */}
              <Droppable droppableId={col.stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 p-2 space-y-2 overflow-y-auto rounded-b-2xl transition-colors"
                    style={{
                      minHeight: 120,
                      background: snapshot.isDraggingOver
                        ? `oklch(from ${colors.bar} l c h / 0.06)`
                        : "transparent",
                    }}
                  >
                    {col.leads.map((lead, idx) => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        brokerMap={brokerMap}
                        index={idx}
                      />
                    ))}
                    {provided.placeholder}
                    {col.leads.length === 0 && (
                      <div className="flex items-center justify-center h-20 text-xs"
                        style={{ color: "var(--c-text-subtle)" }}>
                        Boş
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
