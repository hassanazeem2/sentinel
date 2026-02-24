import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

// ─── Demo Data (mirrors backend /api/demo-deals output) ──────
const DEMO_RESULTS = [
  {
    deal_id: "DEAL-4821",
    deal_name: "Acme Corp — Enterprise Platform",
    overall_risk_score: 88,
    risk_level: "Critical",
    close_probability_percent: 8.5,
    thirty_day_failure_probability: 96.8,
    revenue_at_risk: 215600,
    momentum_classification: "Collapsed",
    behavioral_risk_indicators: [
      "Warning: 13 days since last buyer engagement",
      "Response latency elevated: avg 56h",
      "Meeting frequency collapsed: past meetings held but none scheduled",
      "Engagement asymmetry: 14 sent vs 4 received",
      "Proposal viewed but no follow-up response detected",
    ],
    psychological_risk_indicators: [
      "Price sensitivity elevated: 3 signals detected in communications",
      "Authority avoidance pattern: 2 instances of decision-deflection language",
      "Hesitation language spike: 5 hedging/delay phrases detected",
      "Emotional enthusiasm declining across recent interactions",
      "Objection frequency spike: 4 objections logged",
    ],
    structural_risk_indicators: [
      "No economic buyer identified at proposal+ stage",
      "Stakeholder gap: 2/4 expected stakeholders engaged",
    ],
    competitive_threat_level: "Moderate",
    stakeholder_completeness_percent: 50,
    timeline_risk_assessment:
      "Critical: Deal age (62d) exceeds avg cycle (45d) by 38%",
    intervention_plan: [
      {
        priority: "Immediate",
        action:
          "Identify and engage economic buyer through existing champion or stakeholder mapping; request introduction via James Morton",
        role_owner: "Account Executive + Sales Manager",
        deadline_recommendation: "Within 48 hours",
      },
      {
        priority: "Immediate",
        action:
          "Execute re-engagement sequence: send value-add content to primary contact with specific CTA; if no response in 24h, escalate via phone + LinkedIn outreach",
        role_owner: "Account Executive",
        deadline_recommendation: "Within 24 hours",
      },
      {
        priority: "High",
        action:
          "Deploy competitive displacement strategy: prepare battle card comparison, schedule 245,000-scale ROI presentation",
        role_owner: "Account Executive + Solutions Engineer",
        deadline_recommendation: "Within 5 business days",
      },
    ],
    sales_coaching_recommendation:
      "Implement structured follow-up cadence with no gap exceeding 5 business days; conduct objection handling workshop focused on reframing value over price",
    forecast_adjustment_recommendation:
      "Downgrade to Unlikely. Remove $245,000 from committed forecast. Move to upside/pipeline only.",
    rep_name: "Sarah Chen",
    deal_value: 245000,
    deal_stage: "negotiation",
  },
  {
    deal_id: "DEAL-5133",
    deal_name: "GlobalTech — Data Analytics Suite",
    overall_risk_score: 18,
    risk_level: "Low",
    close_probability_percent: 27.2,
    thirty_day_failure_probability: 19.8,
    revenue_at_risk: 23040,
    momentum_classification: "Strong",
    behavioral_risk_indicators: [],
    psychological_risk_indicators: [],
    structural_risk_indicators: [
      "No executive-level engagement detected at advanced deal stage",
    ],
    competitive_threat_level: "None Detected",
    stakeholder_completeness_percent: 75,
    timeline_risk_assessment:
      "Within range: Deal age (28d) vs avg cycle (45d)",
    intervention_plan: [
      {
        priority: "Medium",
        action:
          "Maintain current engagement cadence; schedule next touchpoint to reinforce value proposition and confirm timeline alignment",
        role_owner: "Account Executive",
        deadline_recommendation: "Within 1 week",
      },
    ],
    sales_coaching_recommendation:
      "Rep performance within acceptable range. Continue current methodology.",
    forecast_adjustment_recommendation:
      "Maintain current forecast position. Deal health indicators within acceptable parameters.",
    rep_name: "Marcus Rivera",
    deal_value: 128000,
    deal_stage: "proposal",
  },
  {
    deal_id: "DEAL-4907",
    deal_name: "NovaCare — Patient Portal License",
    overall_risk_score: 100,
    risk_level: "Critical",
    close_probability_percent: 2,
    thirty_day_failure_probability: 95,
    revenue_at_risk: 89000,
    momentum_classification: "Collapsed",
    behavioral_risk_indicators: [
      "Critical engagement gap: 22 days since last activity",
      "Response latency critical: avg 96h (threshold: 72h)",
      "Meeting frequency collapsed: past meetings held but none scheduled",
      "Engagement asymmetry: 11 sent vs 2 received",
    ],
    psychological_risk_indicators: [
      "Price sensitivity elevated: 4 signals detected",
      "Authority avoidance pattern: 3 instances of decision-deflection language",
      "Hesitation language spike: 7 hedging/delay phrases detected",
      "Emotional enthusiasm declining across recent interactions",
      "Negative sentiment shift: 35% of communications carry negative tone",
      "Objection frequency spike: 6 objections logged",
    ],
    structural_risk_indicators: [
      "No internal champion identified",
      "Single-threaded deal: only 1 stakeholder engaged — high vulnerability",
    ],
    competitive_threat_level: "High",
    stakeholder_completeness_percent: 25,
    timeline_risk_assessment:
      "Critical: Deal age (51d) exceeds avg cycle (45d) by 13%",
    intervention_plan: [
      {
        priority: "Immediate",
        action:
          "Execute re-engagement: send value-add content with specific CTA; if no response in 24h, escalate via phone + LinkedIn outreach",
        role_owner: "Account Executive",
        deadline_recommendation: "Within 24 hours",
      },
      {
        priority: "High",
        action:
          "Multi-thread the deal: identify 2-3 additional stakeholders via org chart research and request warm introductions",
        role_owner: "Account Executive + SDR",
        deadline_recommendation: "Within 72 hours",
      },
      {
        priority: "High",
        action:
          "Deploy competitive displacement strategy: prepare battle card and unique differentiator presentation",
        role_owner: "Account Executive + Solutions Engineer",
        deadline_recommendation: "Within 5 business days",
      },
    ],
    sales_coaching_recommendation:
      "Prioritize multi-threading strategy in all active deals; implement structured follow-up cadence; review deal qualification criteria; conduct objection handling workshop",
    forecast_adjustment_recommendation:
      "Downgrade to Unlikely. Remove $89,000 from committed forecast. Move to upside/pipeline only.",
    rep_name: "Jake Thompson",
    deal_value: 89000,
    deal_stage: "qualification",
  },
  {
    deal_id: "DEAL-5210",
    deal_name: "Meridian Finance — Compliance Module",
    overall_risk_score: 5,
    risk_level: "Low",
    close_probability_percent: 30.7,
    thirty_day_failure_probability: 5.5,
    revenue_at_risk: 8750,
    momentum_classification: "Strong",
    behavioral_risk_indicators: [],
    psychological_risk_indicators: [],
    structural_risk_indicators: [],
    competitive_threat_level: "None Detected",
    stakeholder_completeness_percent: 100,
    timeline_risk_assessment:
      "Within range: Deal age (38d) vs avg cycle (45d)",
    intervention_plan: [
      {
        priority: "Medium",
        action:
          "Maintain current engagement cadence; reinforce value proposition and confirm timeline",
        role_owner: "Account Executive",
        deadline_recommendation: "Within 1 week",
      },
    ],
    sales_coaching_recommendation:
      "Rep performance within acceptable range. Continue current methodology.",
    forecast_adjustment_recommendation:
      "Maintain current forecast position. Deal health indicators within acceptable parameters.",
    rep_name: "Sarah Chen",
    deal_value: 175000,
    deal_stage: "closing",
  },
  {
    deal_id: "DEAL-5089",
    deal_name: "Apex Logistics — Fleet Tracking",
    overall_risk_score: 72,
    risk_level: "High",
    close_probability_percent: 12.8,
    thirty_day_failure_probability: 79.2,
    revenue_at_risk: 48240,
    momentum_classification: "Reversing",
    behavioral_risk_indicators: [
      "Warning: 8 days since last buyer engagement",
      "Response latency elevated: avg 64h",
      "Meeting frequency collapsed: past meetings held but none scheduled",
      "Engagement asymmetry: 9 sent vs 3 received",
      "Proposal sent but NOT viewed — buyer disengagement signal",
    ],
    psychological_risk_indicators: [
      "Hesitation language spike: 4 hedging/delay phrases detected",
      "Emotional enthusiasm declining across recent interactions",
      "Objection frequency spike: 3 objections logged",
    ],
    structural_risk_indicators: [
      "No economic buyer identified at proposal+ stage",
      "Stakeholder gap: 2/4 expected stakeholders engaged",
      "No executive-level engagement detected at advanced deal stage",
    ],
    competitive_threat_level: "High",
    stakeholder_completeness_percent: 50,
    timeline_risk_assessment:
      "Warning: Deal age (44d) approaching cycle limit (45d)",
    intervention_plan: [
      {
        priority: "Immediate",
        action:
          "Identify and engage economic buyer; request introduction via Kevin O'Brien",
        role_owner: "Account Executive + Sales Manager",
        deadline_recommendation: "Within 48 hours",
      },
      {
        priority: "Immediate",
        action:
          "Re-send proposal via alternative channel with executive summary video; confirm correct recipient and offer live walkthrough",
        role_owner: "Account Executive",
        deadline_recommendation: "Within 24 hours",
      },
      {
        priority: "High",
        action:
          "Deploy competitive displacement strategy: battle card comparison and ROI presentation",
        role_owner: "Account Executive + Solutions Engineer",
        deadline_recommendation: "Within 5 business days",
      },
    ],
    sales_coaching_recommendation:
      "Implement structured follow-up cadence with no gap exceeding 5 business days; conduct objection handling workshop",
    forecast_adjustment_recommendation:
      "Downgrade to Best Case. Reduce weighted forecast value by 72% ($48,240 at risk).",
    rep_name: "Marcus Rivera",
    deal_value: 67000,
    deal_stage: "proposal",
  },
];

// ─── Color Utilities ──────────────────────────────────────────
const riskColor = (score) => {
  if (score >= 75) return "#ff3b5c";
  if (score >= 50) return "#ff8c42";
  if (score >= 30) return "#ffd166";
  return "#2ee6a8";
};

const riskBg = (score) => {
  if (score >= 75) return "rgba(255,59,92,0.12)";
  if (score >= 50) return "rgba(255,140,66,0.12)";
  if (score >= 30) return "rgba(255,209,102,0.12)";
  return "rgba(46,230,168,0.12)";
};

const momentumColor = (m) => {
  const map = {
    Strong: "#2ee6a8",
    Moderate: "#ffd166",
    Weak: "#ff8c42",
    Reversing: "#ff6b6b",
    Collapsed: "#ff3b5c",
  };
  return map[m] || "#888";
};

const priorityColor = (p) => {
  const map = { Immediate: "#ff3b5c", High: "#ff8c42", Medium: "#ffd166" };
  return map[p] || "#888";
};

const formatCurrency = (v) =>
  "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });

const stageLabel = (s) =>
  ({ prospecting: "Prospecting", qualification: "Qualification", proposal: "Proposal", negotiation: "Negotiation", closing: "Closing" }[s] || s);

// ─── Ring Chart Component ─────────────────────────────────────
function RiskRing({ score, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = riskColor(score);
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size * 0.28} fontWeight="700" fontFamily="'JetBrains Mono', monospace">
        {score}
      </text>
    </svg>
  );
}

// ─── Mini Sparkline ───────────────────────────────────────────
function Sparkline({ values, color, width = 80, height = 28 }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !values.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const x = d3.scaleLinear().domain([0, values.length - 1]).range([2, width - 2]);
    const y = d3.scaleLinear().domain([0, d3.max(values)]).range([height - 2, 2]);
    const line = d3.line().x((_, i) => x(i)).y((d) => y(d)).curve(d3.curveCatmullRom);
    svg.append("path").datum(values).attr("d", line).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2).attr("opacity", 0.8);
  }, [values, color, width, height]);
  return <svg ref={ref} width={width} height={height} />;
}

// ─── Mini Bar ─────────────────────────────────────────────────
function BarMini({ value, max, color, width = 80 }) {
  return (
    <div style={{ width, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, (value / (max || 1)) * 100)}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
    </div>
  );
}

// ─── Sidebar Icons ────────────────────────────────────────────
const Icons = {
  dashboard: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  deals: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  alerts: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

// ─── Main Application ─────────────────────────────────────────
export default function SentinelAI() {
  const [deals, setDeals] = useState(DEMO_RESULTS);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [expandedKpi, setExpandedKpi] = useState(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const filteredDeals = deals.filter(
    (d) =>
      d.deal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.deal_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = deals.reduce((s, d) => s + (d.deal_value || 0), 0);
  const totalAtRisk = deals.reduce((s, d) => s + d.revenue_at_risk, 0);
  const avgRisk = Math.round(deals.reduce((s, d) => s + d.overall_risk_score, 0) / deals.length);
  const criticalCount = deals.filter((d) => d.risk_level === "Critical").length;

  const sparkData = deals.map((d) => d.overall_risk_score);

  // ── Computed breakdowns for KPI panels ──
  const stageBreakdown = {};
  deals.forEach((d) => {
    const s = stageLabel(d.deal_stage || "");
    if (!stageBreakdown[s]) stageBreakdown[s] = { count: 0, value: 0 };
    stageBreakdown[s].count++;
    stageBreakdown[s].value += d.deal_value || 0;
  });

  const repBreakdown = {};
  deals.forEach((d) => {
    const r = d.rep_name || "Unknown";
    if (!repBreakdown[r]) repBreakdown[r] = { count: 0, value: 0, risk: 0, atRisk: 0 };
    repBreakdown[r].count++;
    repBreakdown[r].value += d.deal_value || 0;
    repBreakdown[r].risk += d.overall_risk_score;
    repBreakdown[r].atRisk += d.revenue_at_risk;
  });

  const riskDistribution = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
  deals.forEach((d) => { if (riskDistribution[d.risk_level] !== undefined) riskDistribution[d.risk_level]++; });

  const momentumDist = {};
  deals.forEach((d) => { momentumDist[d.momentum_classification] = (momentumDist[d.momentum_classification] || 0) + 1; });

  const highestRiskDeal = [...deals].sort((a, b) => b.overall_risk_score - a.overall_risk_score)[0];
  const lowestRiskDeal = [...deals].sort((a, b) => a.overall_risk_score - b.overall_risk_score)[0];
  const biggestAtRisk = [...deals].sort((a, b) => b.revenue_at_risk - a.revenue_at_risk)[0];

  const totalImmediateActions = deals.reduce((s, d) => s + d.intervention_plan.filter((x) => x.priority === "Immediate").length, 0);

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <nav style={styles.sidebar}>
        <div style={styles.logoWrap}>
          <div style={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#2ee6a8" strokeWidth="2.5" />
              <circle cx="16" cy="16" r="6" fill="#2ee6a8" opacity="0.3" />
              <circle cx="16" cy="16" r="3" fill="#2ee6a8" />
              <line x1="16" y1="2" x2="16" y2="8" stroke="#2ee6a8" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="24" x2="16" y2="30" stroke="#2ee6a8" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="16" x2="8" y2="16" stroke="#2ee6a8" strokeWidth="2" strokeLinecap="round" />
              <line x1="24" y1="16" x2="30" y2="16" stroke="#2ee6a8" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        {[
          { key: "dashboard", icon: Icons.dashboard, label: "Dashboard" },
          { key: "deals", icon: Icons.deals, label: "Deals" },
          { key: "alerts", icon: Icons.alerts, label: "Alerts" },
          { key: "settings", icon: Icons.settings, label: "Settings" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => { setActiveNav(item.key); setSelectedDeal(null); }}
            style={{ ...styles.navBtn, ...(activeNav === item.key ? styles.navBtnActive : {}) }}
            title={item.label}
          >
            <span style={{ color: activeNav === item.key ? "#2ee6a8" : "#6b7280" }}>{item.icon}</span>
            <span style={{ ...styles.navLabel, color: activeNav === item.key ? "#e0e0e0" : "#6b7280" }}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Top Bar */}
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>
              {activeNav === "dashboard" && !selectedDeal && "Risk Dashboard"}
              {activeNav === "deals" && !selectedDeal && "Deal Pipeline"}
              {activeNav === "alerts" && !selectedDeal && "Risk Alerts"}
              {activeNav === "settings" && !selectedDeal && "Settings"}
              {selectedDeal && selectedDeal.deal_name}
            </h1>
            <p style={styles.pageSubtitle}>
              {!selectedDeal ? "Sentinel AI • Real-time deal intelligence" : `${selectedDeal.deal_id} • ${stageLabel(selectedDeal.deal_stage)}`}
            </p>
          </div>
          <div style={styles.searchWrap}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="2" style={{ position: "absolute", left: 12, top: 10 }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              style={styles.searchInput}
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Dashboard View */}
        {!selectedDeal && activeNav === "dashboard" && (
          <div style={{ ...styles.fadeIn, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(12px)" }}>
            {/* KPI Row */}
            <div style={styles.kpiRow}>
              {[
                { key: "pipeline", label: "Total Pipeline", value: formatCurrency(totalRevenue), sub: `${deals.length} deals`, color: "#2ee6a8" },
                { key: "atRisk", label: "Revenue at Risk", value: formatCurrency(totalAtRisk), sub: `${((totalAtRisk / totalRevenue) * 100).toFixed(0)}% of pipeline`, color: "#ff3b5c" },
                { key: "avgRisk", label: "Avg Risk Score", value: avgRisk, sub: avgRisk >= 50 ? "Elevated" : "Manageable", color: riskColor(avgRisk) },
                { key: "critical", label: "Critical Deals", value: criticalCount, sub: `of ${deals.length} total`, color: criticalCount > 0 ? "#ff3b5c" : "#2ee6a8" },
              ].map((kpi, i) => (
                <div
                  key={kpi.key}
                  onClick={() => setExpandedKpi(expandedKpi === kpi.key ? null : kpi.key)}
                  style={{
                    ...styles.kpiCard,
                    animationDelay: `${i * 0.1}s`,
                    cursor: "pointer",
                    outline: expandedKpi === kpi.key ? `1px solid ${kpi.color}44` : "none",
                    boxShadow: expandedKpi === kpi.key ? `0 0 20px ${kpi.color}15` : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={styles.kpiLabel}>{kpi.label}</div>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={expandedKpi === kpi.key ? kpi.color : "#4b5563"} strokeWidth="2"
                      style={{ transition: "transform 0.25s, stroke 0.25s", transform: expandedKpi === kpi.key ? "rotate(180deg)" : "rotate(0)" }}>
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div style={{ ...styles.kpiValue, color: kpi.color }}>{kpi.value}</div>
                  <div style={styles.kpiSub}>{kpi.sub}</div>
                  <Sparkline values={sparkData} color={kpi.color} width={70} height={24} />
                </div>
              ))}
            </div>

            {/* ── KPI Expanded Detail Panels ── */}
            {expandedKpi && (
              <div style={{ ...styles.kpiDetailPanel, animation: "fadeUp 0.35s ease both" }}>
                {/* PIPELINE BREAKDOWN */}
                {expandedKpi === "pipeline" && (
                  <div>
                    <div style={styles.kpiDetailHeader}>
                      <h3 style={{ ...styles.kpiDetailTitle, color: "#2ee6a8" }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2ee6a8" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Pipeline Breakdown
                      </h3>
                      <button onClick={() => setExpandedKpi(null)} style={styles.kpiCloseBtn}>✕</button>
                    </div>
                    <div style={styles.kpiDetailGrid}>
                      <div style={styles.kpiDetailSection}>
                        <div style={styles.kpiDetailSectionLabel}>By Stage</div>
                        {Object.entries(stageBreakdown).map(([stage, data]) => (
                          <div key={stage} style={styles.kpiDetailRow}>
                            <span style={styles.kpiDetailRowLabel}>{stage}</span>
                            <div style={{ flex: 1, margin: "0 12px" }}>
                              <BarMini value={data.value} max={totalRevenue} color="#2ee6a8" />
                            </div>
                            <span style={styles.kpiDetailRowValue}>{formatCurrency(data.value)}</span>
                            <span style={styles.kpiDetailRowCount}>{data.count} deal{data.count > 1 ? "s" : ""}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.kpiDetailSection}>
                        <div style={styles.kpiDetailSectionLabel}>By Rep</div>
                        {Object.entries(repBreakdown).map(([rep, data]) => (
                          <div key={rep} style={styles.kpiDetailRow}>
                            <span style={styles.kpiDetailRowLabel}>{rep}</span>
                            <div style={{ flex: 1, margin: "0 12px" }}>
                              <BarMini value={data.value} max={totalRevenue} color="#2ee6a8" />
                            </div>
                            <span style={styles.kpiDetailRowValue}>{formatCurrency(data.value)}</span>
                            <span style={styles.kpiDetailRowCount}>{data.count} deal{data.count > 1 ? "s" : ""}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.kpiDetailSection}>
                        <div style={styles.kpiDetailSectionLabel}>Largest Deal</div>
                        <div style={styles.kpiHighlightCard}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0" }}>{[...deals].sort((a, b) => (b.deal_value||0) - (a.deal_value||0))[0]?.deal_name}</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: "#2ee6a8", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                            {formatCurrency([...deals].sort((a, b) => (b.deal_value||0) - (a.deal_value||0))[0]?.deal_value || 0)}
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{[...deals].sort((a, b) => (b.deal_value||0) - (a.deal_value||0))[0]?.deal_id}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* REVENUE AT RISK BREAKDOWN */}
                {expandedKpi === "atRisk" && (
                  <div>
                    <div style={styles.kpiDetailHeader}>
                      <h3 style={{ ...styles.kpiDetailTitle, color: "#ff3b5c" }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ff3b5c" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        Revenue at Risk Breakdown
                      </h3>
                      <button onClick={() => setExpandedKpi(null)} style={styles.kpiCloseBtn}>✕</button>
                    </div>
                    <div style={styles.kpiDetailGrid}>
                      <div style={{ ...styles.kpiDetailSection, gridColumn: "1 / -1" }}>
                        <div style={styles.kpiDetailSectionLabel}>Deals Ranked by Revenue at Risk</div>
                        {[...deals].sort((a, b) => b.revenue_at_risk - a.revenue_at_risk).map((d) => (
                          <div key={d.deal_id} style={{ ...styles.kpiDetailRow, cursor: "pointer" }} onClick={() => setSelectedDeal(d)}>
                            <div style={{ ...styles.riskDot, background: riskColor(d.overall_risk_score), flexShrink: 0 }} />
                            <span style={{ ...styles.kpiDetailRowLabel, flex: "none", width: 220 }}>{d.deal_name}</span>
                            <div style={{ flex: 1, margin: "0 12px" }}>
                              <BarMini value={d.revenue_at_risk} max={biggestAtRisk?.revenue_at_risk || 1} color={riskColor(d.overall_risk_score)} />
                            </div>
                            <span style={{ ...styles.kpiDetailRowValue, color: "#ff6b6b" }}>{formatCurrency(d.revenue_at_risk)}</span>
                            <span style={{ ...styles.riskBadge, background: riskBg(d.overall_risk_score), color: riskColor(d.overall_risk_score), marginLeft: 8 }}>
                              {d.risk_level}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.kpiDetailSection}>
                        <div style={styles.kpiDetailSectionLabel}>By Rep Exposure</div>
                        {Object.entries(repBreakdown).map(([rep, data]) => (
                          <div key={rep} style={styles.kpiDetailRow}>
                            <span style={styles.kpiDetailRowLabel}>{rep}</span>
                            <div style={{ flex: 1, margin: "0 12px" }}>
                              <BarMini value={data.atRisk} max={totalAtRisk} color="#ff3b5c" />
                            </div>
                            <span style={{ ...styles.kpiDetailRowValue, color: "#ff6b6b" }}>{formatCurrency(data.atRisk)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.kpiDetailSection}>
                        <div style={styles.kpiDetailSectionLabel}>Immediate Actions Required</div>
                        <div style={styles.kpiHighlightCard}>
                          <div style={{ fontSize: 32, fontWeight: 700, color: "#ff3b5c", fontFamily: "'JetBrains Mono', monospace" }}>{totalImmediateActions}</div>
                          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Immediate-priority interventions across all at-risk deals</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AVG RISK SCORE BREAKDOWN */}
                {expandedKpi === "avgRisk" && (
                  <div>
                    <div style={styles.kpiDetailHeader}>
                      <h3 style={{ ...styles.kpiDetailTitle, color: riskColor(avgRisk) }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={riskColor(avgRisk)} strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Risk Score Distribution
                      </h3>
                      <button onClick={() => setExpandedKpi(null)} style={styles.kpiCloseBtn}>✕</button>
                    </div>
                    <div style={styles.kpiDetailGrid}>
                      <div style={styles.kpiDetailSection}>
                        <div style={styles.kpiDetailSectionLabel}>Risk Level Distribution</div>
                        {Object.entries(riskDistribution).map(([level, count]) => {
                          const levelColors = { Low: "#2ee6a8", Moderate: "#ffd166", High: "#ff8c42", Critical: "#ff3b5c" };
                          return (
                            <div key={level} style={styles.kpiDetailRow}>
                              <div style={{ ...styles.riskDot, background: levelColors[level], flexShrink: 0 }} />
                              <span style={styles.kpiDetailRowLabel}>{level}</span>
                              <div style={{ flex: 1, margin: "0 12px" }}>
                                <BarMini value={count} max={deals.length} color={levelColors[level]} />
                              </div>
                              <span style={{ ...styles.kpiDetailRowValue, color: levelColors[level] }}>{count}</span>
                              <span style={styles.kpiDetailRowCount}>{((count / deals.length) * 100).toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={styles.kpiDetailSection}>
                        <div style={styles.kpiDetailSectionLabel}>Momentum Distribution</div>
                        {Object.entries(momentumDist).map(([m, count]) => (
                          <div key={m} style={styles.kpiDetailRow}>
                            <div style={{ ...styles.riskDot, background: momentumColor(m), flexShrink: 0 }} />
                            <span style={styles.kpiDetailRowLabel}>{m}</span>
                            <div style={{ flex: 1, margin: "0 12px" }}>
                              <BarMini value={count} max={deals.length} color={momentumColor(m)} />
                            </div>
                            <span style={{ ...styles.kpiDetailRowValue, color: momentumColor(m) }}>{count}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.kpiDetailSection}>
                        <div style={styles.kpiDetailSectionLabel}>Extremes</div>
                        <div style={{ display: "flex", gap: 12 }}>
                          <div style={{ ...styles.kpiHighlightCard, flex: 1, cursor: "pointer" }} onClick={() => setSelectedDeal(highestRiskDeal)}>
                            <div style={{ fontSize: 10, color: "#ff3b5c", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Highest Risk</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>{highestRiskDeal?.deal_name}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#ff3b5c", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{highestRiskDeal?.overall_risk_score}</div>
                          </div>
                          <div style={{ ...styles.kpiHighlightCard, flex: 1, cursor: "pointer" }} onClick={() => setSelectedDeal(lowestRiskDeal)}>
                            <div style={{ fontSize: 10, color: "#2ee6a8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Lowest Risk</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>{lowestRiskDeal?.deal_name}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#2ee6a8", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{lowestRiskDeal?.overall_risk_score}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CRITICAL DEALS BREAKDOWN */}
                {expandedKpi === "critical" && (
                  <div>
                    <div style={styles.kpiDetailHeader}>
                      <h3 style={{ ...styles.kpiDetailTitle, color: "#ff3b5c" }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ff3b5c" strokeWidth="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Critical & High-Risk Deals
                      </h3>
                      <button onClick={() => setExpandedKpi(null)} style={styles.kpiCloseBtn}>✕</button>
                    </div>
                    <div style={styles.kpiDetailGrid}>
                      <div style={{ ...styles.kpiDetailSection, gridColumn: "1 / -1" }}>
                        {deals.filter((d) => d.risk_level === "Critical" || d.risk_level === "High").length === 0 ? (
                          <div style={{ textAlign: "center", padding: 20, color: "#2ee6a8" }}>No critical deals — pipeline is healthy</div>
                        ) : (
                          deals.filter((d) => d.risk_level === "Critical" || d.risk_level === "High").sort((a, b) => b.overall_risk_score - a.overall_risk_score).map((d) => (
                            <div key={d.deal_id} style={styles.criticalDealCard} onClick={() => setSelectedDeal(d)}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                <div>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0" }}>{d.deal_name}</div>
                                  <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{d.deal_id} • {d.rep_name}</div>
                                </div>
                                <RiskRing score={d.overall_risk_score} size={48} stroke={4} />
                              </div>
                              <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
                                <div><div style={styles.criticalStatLabel}>Value</div><div style={styles.criticalStatValue}>{formatCurrency(d.deal_value || 0)}</div></div>
                                <div><div style={styles.criticalStatLabel}>At Risk</div><div style={{ ...styles.criticalStatValue, color: "#ff6b6b" }}>{formatCurrency(d.revenue_at_risk)}</div></div>
                                <div><div style={styles.criticalStatLabel}>30-Day Failure</div><div style={{ ...styles.criticalStatValue, color: "#ff3b5c" }}>{d.thirty_day_failure_probability}%</div></div>
                                <div><div style={styles.criticalStatLabel}>Momentum</div><div style={{ ...styles.criticalStatValue, color: momentumColor(d.momentum_classification) }}>{d.momentum_classification}</div></div>
                              </div>
                              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>Top Risk Indicators:</div>
                              {[...d.behavioral_risk_indicators, ...d.structural_risk_indicators].slice(0, 3).map((r, i) => (
                                <div key={i} style={{ fontSize: 11, color: "#d1d5db", padding: "3px 0", display: "flex", alignItems: "flex-start", gap: 6 }}>
                                  <span style={{ color: "#ff3b5c", flexShrink: 0 }}>▸</span>{r}
                                </div>
                              ))}
                              {d.intervention_plan.filter((x) => x.priority === "Immediate").length > 0 && (
                                <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,59,92,0.06)", borderRadius: 8, border: "1px solid rgba(255,59,92,0.12)" }}>
                                  <div style={{ fontSize: 10, color: "#ff3b5c", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.6, marginBottom: 4 }}>Immediate Action</div>
                                  <div style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.5 }}>{d.intervention_plan.find((x) => x.priority === "Immediate")?.action}</div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Deals Table */}
            <div style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <h2 style={styles.sectionTitle}>Deal Risk Overview</h2>
                <span style={styles.badge}>{filteredDeals.length} deals</span>
              </div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Deal", "Value", "Stage", "Risk", "Momentum", "Close %", "At Risk", ""].map((h, i) => (
                        <th key={i} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeals.map((d, i) => (
                      <tr
                        key={d.deal_id}
                        style={{ ...styles.tr, animationDelay: `${i * 0.05}s` }}
                        onClick={() => setSelectedDeal(d)}
                      >
                        <td style={styles.td}>
                          <div style={styles.dealName}>{d.deal_name}</div>
                          <div style={styles.dealSub}>{d.deal_id} • {d.rep_name || ""}</div>
                        </td>
                        <td style={styles.td}>{formatCurrency(d.deal_value || 0)}</td>
                        <td style={styles.td}>
                          <span style={styles.stageChip}>{stageLabel(d.deal_stage || "")}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ ...styles.riskDot, background: riskColor(d.overall_risk_score) }} />
                            <span style={{ color: riskColor(d.overall_risk_score), fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                              {d.overall_risk_score}
                            </span>
                            <span style={{ ...styles.riskBadge, background: riskBg(d.overall_risk_score), color: riskColor(d.overall_risk_score) }}>
                              {d.risk_level}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: momentumColor(d.momentum_classification), fontWeight: 500 }}>
                            {d.momentum_classification}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.close_probability_percent}%</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: "#ff6b6b", fontFamily: "'JetBrains Mono', monospace" }}>
                            {formatCurrency(d.revenue_at_risk)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button style={styles.viewBtn}>→</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Deal Detail View */}
        {selectedDeal && (
          <div style={{ ...styles.fadeIn, opacity: loaded ? 1 : 0 }}>
            <button onClick={() => setSelectedDeal(null)} style={styles.backBtn}>
              ← Back to Dashboard
            </button>

            <div style={styles.detailGrid}>
              {/* Left Column */}
              <div style={styles.detailLeft}>
                {/* Risk Ring */}
                <div style={styles.ringCard}>
                  <RiskRing score={selectedDeal.overall_risk_score} size={160} stroke={12} />
                  <div style={styles.ringMeta}>
                    <span style={{ ...styles.riskBadgeLg, background: riskBg(selectedDeal.overall_risk_score), color: riskColor(selectedDeal.overall_risk_score) }}>
                      {selectedDeal.risk_level} Risk
                    </span>
                    <div style={styles.ringStats}>
                      <div>
                        <div style={styles.ringStatLabel}>Close Probability</div>
                        <div style={{ ...styles.ringStatValue, color: "#2ee6a8" }}>{selectedDeal.close_probability_percent}%</div>
                      </div>
                      <div>
                        <div style={styles.ringStatLabel}>30-Day Failure</div>
                        <div style={{ ...styles.ringStatValue, color: "#ff3b5c" }}>{selectedDeal.thirty_day_failure_probability}%</div>
                      </div>
                      <div>
                        <div style={styles.ringStatLabel}>Revenue at Risk</div>
                        <div style={{ ...styles.ringStatValue, color: "#ff8c42" }}>{formatCurrency(selectedDeal.revenue_at_risk)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Momentum & Competition */}
                <div style={styles.metaRow}>
                  <div style={styles.metaCard}>
                    <div style={styles.metaLabel}>Momentum</div>
                    <div style={{ ...styles.metaValue, color: momentumColor(selectedDeal.momentum_classification) }}>
                      {selectedDeal.momentum_classification}
                    </div>
                  </div>
                  <div style={styles.metaCard}>
                    <div style={styles.metaLabel}>Competitive Threat</div>
                    <div style={{ ...styles.metaValue, color: selectedDeal.competitive_threat_level === "High" ? "#ff3b5c" : selectedDeal.competitive_threat_level === "Moderate" ? "#ff8c42" : "#2ee6a8" }}>
                      {selectedDeal.competitive_threat_level}
                    </div>
                  </div>
                  <div style={styles.metaCard}>
                    <div style={styles.metaLabel}>Stakeholder Coverage</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={styles.progressBg}>
                        <div style={{ ...styles.progressFill, width: `${selectedDeal.stakeholder_completeness_percent}%`, background: selectedDeal.stakeholder_completeness_percent >= 75 ? "#2ee6a8" : "#ff8c42" }} />
                      </div>
                      <span style={{ ...styles.metaValue, fontSize: 14 }}>{selectedDeal.stakeholder_completeness_percent}%</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Assessment */}
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Timeline Assessment</div>
                  <div style={styles.infoText}>{selectedDeal.timeline_risk_assessment}</div>
                </div>

                {/* Risk Indicators */}
                {[
                  { title: "Behavioral Risks", items: selectedDeal.behavioral_risk_indicators, color: "#ff8c42" },
                  { title: "Psychological Risks", items: selectedDeal.psychological_risk_indicators, color: "#e879f9" },
                  { title: "Structural Risks", items: selectedDeal.structural_risk_indicators, color: "#ff3b5c" },
                ].map((section) =>
                  section.items.length > 0 ? (
                    <div key={section.title} style={styles.riskSection}>
                      <h3 style={{ ...styles.riskSectionTitle, color: section.color }}>
                        <span style={{ ...styles.riskSectionDot, background: section.color }} />
                        {section.title}
                      </h3>
                      {section.items.map((item, i) => (
                        <div key={i} style={styles.riskItem}>
                          <span style={{ ...styles.riskItemDot, background: section.color }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : null
                )}
              </div>

              {/* Right Column — Interventions */}
              <div style={styles.detailRight}>
                <div style={styles.interventionCard}>
                  <h3 style={styles.interventionTitle}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2ee6a8" strokeWidth="2">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Intervention Plan
                  </h3>
                  {selectedDeal.intervention_plan.map((item, i) => (
                    <div key={i} style={styles.interventionItem}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ ...styles.priorityBadge, background: `${priorityColor(item.priority)}22`, color: priorityColor(item.priority), borderColor: `${priorityColor(item.priority)}44` }}>
                          {item.priority}
                        </span>
                        <span style={styles.interventionDeadline}>{item.deadline_recommendation}</span>
                      </div>
                      <div style={styles.interventionAction}>{item.action}</div>
                      <div style={styles.interventionOwner}>→ {item.role_owner}</div>
                    </div>
                  ))}
                </div>

                {/* Coaching */}
                <div style={styles.coachCard}>
                  <h3 style={styles.coachTitle}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ffd166" strokeWidth="2">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Sales Coaching
                  </h3>
                  <p style={styles.coachText}>{selectedDeal.sales_coaching_recommendation}</p>
                </div>

                {/* Forecast */}
                <div style={styles.forecastCard}>
                  <h3 style={styles.forecastTitle}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#e879f9" strokeWidth="2">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Forecast Adjustment
                  </h3>
                  <p style={styles.forecastText}>{selectedDeal.forecast_adjustment_recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts View */}
        {!selectedDeal && activeNav === "alerts" && (
          <div style={styles.fadeIn}>
            <div style={styles.tableCard}>
              <h2 style={styles.sectionTitle}>Active Risk Alerts</h2>
              {deals
                .filter((d) => d.risk_level === "Critical" || d.risk_level === "High")
                .map((d) => (
                  <div key={d.deal_id} style={styles.alertRow} onClick={() => { setSelectedDeal(d); setActiveNav("dashboard"); }}>
                    <div style={{ ...styles.alertDot, background: riskColor(d.overall_risk_score) }} />
                    <div style={{ flex: 1 }}>
                      <div style={styles.alertDeal}>{d.deal_name}</div>
                      <div style={styles.alertDetail}>
                        {d.behavioral_risk_indicators[0] || d.structural_risk_indicators[0] || d.psychological_risk_indicators[0]}
                      </div>
                    </div>
                    <span style={{ ...styles.riskBadge, background: riskBg(d.overall_risk_score), color: riskColor(d.overall_risk_score) }}>
                      {d.risk_level}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Deals View */}
        {!selectedDeal && activeNav === "deals" && (
          <div style={styles.fadeIn}>
            <div style={styles.dealsGrid}>
              {filteredDeals.map((d) => (
                <div key={d.deal_id} style={styles.dealCard} onClick={() => { setSelectedDeal(d); setActiveNav("dashboard"); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={styles.dealCardName}>{d.deal_name}</div>
                      <div style={styles.dealCardSub}>{d.deal_id} • {d.rep_name}</div>
                    </div>
                    <RiskRing score={d.overall_risk_score} size={56} stroke={5} />
                  </div>
                  <div style={styles.dealCardRow}>
                    <span>{formatCurrency(d.deal_value || 0)}</span>
                    <span style={styles.stageChip}>{stageLabel(d.deal_stage || "")}</span>
                    <span style={{ color: momentumColor(d.momentum_classification) }}>{d.momentum_classification}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings View */}
        {!selectedDeal && activeNav === "settings" && (
          <div style={styles.fadeIn}>
            <div style={{ ...styles.tableCard, maxWidth: 600 }}>
              <h2 style={styles.sectionTitle}>Engine Configuration</h2>
              <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 20 }}>
                Adjust Sentinel AI risk engine parameters for your organization.
              </p>
              {[
                { label: "Average Deal Cycle (days)", value: "45" },
                { label: "Typical Stakeholder Count", value: "4" },
                { label: "Historical Close Rate (%)", value: "32" },
                { label: "Average Deal Value ($)", value: "85,000" },
                { label: "Industry", value: "SaaS" },
              ].map((setting, i) => (
                <div key={i} style={styles.settingRow}>
                  <label style={styles.settingLabel}>{setting.label}</label>
                  <input style={styles.settingInput} defaultValue={setting.value} />
                </div>
              ))}
              <button style={styles.saveBtn}>Save Configuration</button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0e17; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rowFade { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const glass = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  backdropFilter: "blur(20px)",
};

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(145deg, #0a0e17 0%, #0d1321 50%, #0a0e17 100%)",
    fontFamily: "'DM Sans', sans-serif",
    color: "#e0e0e0",
  },
  sidebar: {
    width: 72,
    minHeight: "100vh",
    background: "rgba(0,0,0,0.4)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 16,
    gap: 4,
    position: "sticky",
    top: 0,
  },
  logoWrap: { marginBottom: 20, padding: "8px 0" },
  logo: { width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" },
  navBtn: {
    width: 56,
    height: 52,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    background: "transparent",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  navBtnActive: { background: "rgba(46,230,168,0.08)" },
  navLabel: { fontSize: 9, fontWeight: 500, letterSpacing: 0.3 },
  main: { flex: 1, padding: "20px 28px", maxWidth: 1280, overflowY: "auto" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
  },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#f0f0f0", letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" },
  searchWrap: { position: "relative" },
  searchInput: {
    width: 240,
    height: 36,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "0 12px 0 36px",
    color: "#e0e0e0",
    fontSize: 13,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  fadeIn: { animation: "fadeUp 0.5s ease forwards", transition: "all 0.4s ease" },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 },
  kpiCard: {
    ...glass,
    padding: "18px 20px",
    animation: "fadeUp 0.5s ease both",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  kpiLabel: { fontSize: 11, color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8 },
  kpiValue: { fontSize: 26, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  kpiSub: { fontSize: 12, color: "#9ca3af" },
  tableCard: { ...glass, padding: "20px 24px" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: "#f0f0f0" },
  badge: {
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 20,
    background: "rgba(46,230,168,0.1)",
    color: "#2ee6a8",
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    fontSize: 10,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tr: { cursor: "pointer", transition: "background 0.2s", animation: "rowFade 0.4s ease both" },
  td: { padding: "12px 12px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.03)", verticalAlign: "middle" },
  dealName: { fontWeight: 600, fontSize: 13, color: "#f0f0f0" },
  dealSub: { fontSize: 11, color: "#6b7280", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" },
  stageChip: { fontSize: 11, padding: "2px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: "#9ca3af", fontWeight: 500 },
  riskDot: { width: 8, height: 8, borderRadius: "50%" },
  riskBadge: { fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" },
  viewBtn: { width: 28, height: 28, borderRadius: 8, background: "rgba(46,230,168,0.1)", border: "1px solid rgba(46,230,168,0.2)", color: "#2ee6a8", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  backBtn: { background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 },
  detailLeft: { display: "flex", flexDirection: "column", gap: 16 },
  detailRight: { display: "flex", flexDirection: "column", gap: 16 },
  ringCard: { ...glass, padding: 24, display: "flex", alignItems: "center", gap: 28 },
  ringMeta: { flex: 1 },
  riskBadgeLg: { display: "inline-block", fontSize: 13, padding: "4px 14px", borderRadius: 8, fontWeight: 700, marginBottom: 16 },
  ringStats: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  ringStatLabel: { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 },
  ringStatValue: { fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  metaRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  metaCard: { ...glass, padding: "14px 16px" },
  metaLabel: { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  metaValue: { fontSize: 15, fontWeight: 700 },
  progressBg: { flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, transition: "width 0.8s ease" },
  infoCard: { ...glass, padding: "14px 18px" },
  infoLabel: { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  infoText: { fontSize: 13, color: "#d1d5db", lineHeight: 1.5 },
  riskSection: { ...glass, padding: "16px 18px" },
  riskSectionTitle: { fontSize: 13, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 },
  riskSectionDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  riskItem: { fontSize: 12, color: "#d1d5db", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 },
  riskItemDot: { width: 5, height: 5, borderRadius: "50%", flexShrink: 0, marginTop: 5 },
  interventionCard: { ...glass, padding: "20px 22px" },
  interventionTitle: { fontSize: 14, fontWeight: 600, color: "#2ee6a8", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 },
  interventionItem: { padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  priorityBadge: { fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 700, border: "1px solid", fontFamily: "'JetBrains Mono', monospace" },
  interventionDeadline: { fontSize: 11, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" },
  interventionAction: { fontSize: 12, color: "#d1d5db", lineHeight: 1.6, marginBottom: 4 },
  interventionOwner: { fontSize: 11, color: "#2ee6a8", fontWeight: 500 },
  coachCard: { ...glass, padding: "18px 20px" },
  coachTitle: { fontSize: 14, fontWeight: 600, color: "#ffd166", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 },
  coachText: { fontSize: 12, color: "#d1d5db", lineHeight: 1.6 },
  forecastCard: { ...glass, padding: "18px 20px" },
  forecastTitle: { fontSize: 14, fontWeight: 600, color: "#e879f9", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 },
  forecastText: { fontSize: 12, color: "#d1d5db", lineHeight: 1.6 },
  alertRow: { display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.2s" },
  alertDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  alertDeal: { fontSize: 14, fontWeight: 600, color: "#f0f0f0" },
  alertDetail: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  dealsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 },
  dealCard: { ...glass, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s" },
  dealCardName: { fontSize: 14, fontWeight: 600, color: "#f0f0f0", marginBottom: 2 },
  dealCardSub: { fontSize: 11, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" },
  dealCardRow: { display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 12, color: "#9ca3af" },
  settingRow: { marginBottom: 16 },
  settingLabel: { display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 6 },
  settingInput: { width: "100%", height: 36, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "0 12px", color: "#e0e0e0", fontSize: 13, outline: "none", fontFamily: "'JetBrains Mono', monospace" },
  saveBtn: { marginTop: 8, padding: "8px 24px", background: "rgba(46,230,168,0.15)", border: "1px solid rgba(46,230,168,0.3)", borderRadius: 8, color: "#2ee6a8", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  kpiDetailPanel: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    backdropFilter: "blur(20px)",
    padding: "20px 24px",
    marginBottom: 20,
    marginTop: -6,
  },
  kpiDetailHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  kpiDetailTitle: { fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 },
  kpiCloseBtn: { width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  kpiDetailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 },
  kpiDetailSection: { display: "flex", flexDirection: "column", gap: 8 },
  kpiDetailSectionLabel: { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 },
  kpiDetailRow: { display: "flex", alignItems: "center", gap: 8, padding: "5px 0" },
  kpiDetailRowLabel: { fontSize: 12, color: "#d1d5db", fontWeight: 500, minWidth: 80 },
  kpiDetailRowValue: { fontSize: 12, fontWeight: 600, color: "#f0f0f0", fontFamily: "'JetBrains Mono', monospace", minWidth: 70, textAlign: "right" },
  kpiDetailRowCount: { fontSize: 11, color: "#6b7280", minWidth: 50, textAlign: "right" },
  kpiHighlightCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" },
  criticalDealCard: { background: "rgba(255,59,92,0.04)", border: "1px solid rgba(255,59,92,0.1)", borderRadius: 12, padding: "16px 18px", marginBottom: 12, cursor: "pointer", transition: "all 0.2s" },
  criticalStatLabel: { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6 },
  criticalStatValue: { fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#f0f0f0", marginTop: 2 },
};
