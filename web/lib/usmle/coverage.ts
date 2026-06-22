// Coverage + weakness scoring. Pure functions so the route stays thin and this
// is unit-testable. Aggregation unit is the top-level taxonomy node (e.g.
// "cardiovascular", "biochemistry"), matching the tracker tree.
// See docs/usmle-prep-app/master-plan.md §5 (Weakness Analytics).

/** Maps a topic's coverage status to a 0..1 fraction. */
export const STATUS_FRACTION: Record<string, number> = {
  not_started: 0,
  learning: 0.34,
  reviewed: 0.67,
  confident: 1,
};

export interface TopicRow {
  id: string;
  parent_id: string | null;
  name: string;
  organ_system: string;
  exam_weight: number | null;
  status: string | null;
}

export interface CardStatRow {
  node: string; // top-level node id the card rolls up to
  due: number; // 1 if due now else 0
  mature: number; // 1 if state = 'review' else 0
}

export interface SystemCoverage {
  nodeId: string;
  name: string;
  organSystem: string;
  examWeight: number | null;
  isWeighted: boolean; // false for General Principles (no blueprint %)
  leafTopics: number;
  coverage: number; // 0..1, status-based
  byStatus: Record<string, number>;
  cards: number;
  due: number;
  mature: number;
  gapScore: number; // examWeight * (1 - coverage); 0 when unweighted
}

export interface CoverageReport {
  overall: {
    weightedCoverage: number; // 0..1 across weighted (organ-system) nodes
    simpleCoverage: number; // 0..1 unweighted across all leaf topics
    leafTopics: number;
  };
  systems: SystemCoverage[]; // sorted by examWeight desc, unweighted last
  weakest: SystemCoverage[]; // weighted systems sorted by gapScore desc (top 5)
}

export function computeCoverage(topics: TopicRow[], cardStats: CardStatRow[]): CoverageReport {
  // Metadata for each top-level node.
  const nodeMeta = new Map<string, { name: string; organSystem: string; examWeight: number | null }>();
  for (const t of topics) {
    if (t.parent_id === null)
      nodeMeta.set(t.id, { name: t.name, organSystem: t.organ_system, examWeight: t.exam_weight });
  }

  // Group leaf topics (subtopics) by their parent (top-level) node.
  const leaves = topics.filter((t) => t.parent_id !== null);
  const byNode = new Map<string, TopicRow[]>();
  for (const t of leaves) {
    const arr = byNode.get(t.parent_id!) ?? [];
    arr.push(t);
    byNode.set(t.parent_id!, arr);
  }

  // Card stats per node.
  const cardsByNode = new Map<string, { cards: number; due: number; mature: number }>();
  for (const c of cardStats) {
    const agg = cardsByNode.get(c.node) ?? { cards: 0, due: 0, mature: 0 };
    agg.cards += 1;
    agg.due += c.due ? 1 : 0;
    agg.mature += c.mature ? 1 : 0;
    cardsByNode.set(c.node, agg);
  }

  const systems: SystemCoverage[] = [];
  for (const [nodeId, rows] of byNode) {
    const meta = nodeMeta.get(nodeId) ?? { name: nodeId, organSystem: "", examWeight: rows[0].exam_weight };
    const byStatus: Record<string, number> = { not_started: 0, learning: 0, reviewed: 0, confident: 0 };
    let sum = 0;
    for (const r of rows) {
      const status = r.status ?? "not_started";
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      sum += STATUS_FRACTION[status] ?? 0;
    }
    const coverage = rows.length ? sum / rows.length : 0;
    const examWeight = meta.examWeight;
    const isWeighted = examWeight != null;
    const cardAgg = cardsByNode.get(nodeId) ?? { cards: 0, due: 0, mature: 0 };
    systems.push({
      nodeId,
      name: meta.name,
      organSystem: meta.organSystem,
      examWeight,
      isWeighted,
      leafTopics: rows.length,
      coverage,
      byStatus,
      cards: cardAgg.cards,
      due: cardAgg.due,
      mature: cardAgg.mature,
      gapScore: isWeighted ? examWeight! * (1 - coverage) : 0,
    });
  }

  // Sort: weighted systems by exam weight desc, then unweighted (foundational).
  systems.sort((a, b) => {
    if (a.isWeighted !== b.isWeighted) return a.isWeighted ? -1 : 1;
    return (b.examWeight ?? 0) - (a.examWeight ?? 0);
  });

  // Overall weighted coverage across weighted systems (exam-priority weighting).
  let wSum = 0;
  let wTotal = 0;
  for (const s of systems) {
    if (!s.isWeighted) continue;
    wSum += s.examWeight! * s.coverage;
    wTotal += s.examWeight!;
  }
  const weightedCoverage = wTotal ? wSum / wTotal : 0;

  const simpleCoverage = leaves.length
    ? leaves.reduce((acc, t) => acc + (STATUS_FRACTION[t.status ?? "not_started"] ?? 0), 0) / leaves.length
    : 0;

  const weakest = systems
    .filter((s) => s.isWeighted)
    .slice()
    .sort((a, b) => b.gapScore - a.gapScore)
    .slice(0, 5);

  return {
    overall: { weightedCoverage, simpleCoverage, leafTopics: leaves.length },
    systems,
    weakest,
  };
}
