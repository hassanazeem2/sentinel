"""
Sentinel AI — B2B Deal Risk Intelligence Engine
FastAPI Backend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta
import json
import math

app = FastAPI(title="Sentinel AI", version="1.0.0", description="B2B Deal Risk Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Data Models ───────────────────────────────────────────────

class CompanyProfile(BaseModel):
    average_deal_cycle_days: int = 45
    typical_stakeholder_count: int = 4
    industry: str = "SaaS"
    historical_close_rate: float = 0.32
    average_deal_value: float = 85000.0

class StakeholderInfo(BaseModel):
    name: str
    role: str
    title: str
    engagement_score: float = Field(ge=0, le=100)
    last_activity_date: str
    is_economic_buyer: bool = False
    is_champion: bool = False

class ActivityLog(BaseModel):
    emails_sent: int = 0
    emails_received: int = 0
    meetings_held: int = 0
    meetings_scheduled: int = 0
    calls_completed: int = 0
    proposal_sent: bool = False
    proposal_viewed: bool = False
    proposal_view_date: Optional[str] = None
    last_engagement_date: str = ""
    avg_response_time_hours: float = 24.0

class SentimentData(BaseModel):
    positive_ratio: float = 0.5
    negative_ratio: float = 0.1
    neutral_ratio: float = 0.4
    objection_count: int = 0
    competitor_mentions: int = 0
    price_sensitivity_signals: int = 0
    authority_avoidance_signals: int = 0
    hesitation_phrases: int = 0
    enthusiasm_trend: str = "stable"  # rising, stable, declining

class DealInput(BaseModel):
    deal_id: str
    deal_name: str
    deal_value: float
    deal_stage: str  # prospecting, qualification, proposal, negotiation, closing
    deal_age_days: int
    expected_close_date: str
    rep_name: str
    rep_win_rate: float = 0.30
    company_profile: CompanyProfile = CompanyProfile()
    stakeholders: list[StakeholderInfo] = []
    activity: ActivityLog = ActivityLog()
    sentiment: SentimentData = SentimentData()

class InterventionItem(BaseModel):
    priority: str
    action: str
    role_owner: str
    deadline_recommendation: str

class DealRiskOutput(BaseModel):
    deal_id: str
    deal_name: str
    overall_risk_score: int
    risk_level: str
    close_probability_percent: float
    thirty_day_failure_probability: float
    revenue_at_risk: float
    momentum_classification: str
    behavioral_risk_indicators: list[str]
    psychological_risk_indicators: list[str]
    structural_risk_indicators: list[str]
    competitive_threat_level: str
    stakeholder_completeness_percent: float
    timeline_risk_assessment: str
    intervention_plan: list[InterventionItem]
    sales_coaching_recommendation: str
    forecast_adjustment_recommendation: str

# ─── Risk Engine ───────────────────────────────────────────────

def analyze_deal(deal: DealInput) -> DealRiskOutput:
    """Core Sentinel AI risk analysis engine."""
    
    cp = deal.company_profile
    act = deal.activity
    sent = deal.sentiment
    
    behavioral_risks = []
    psychological_risks = []
    structural_risks = []
    interventions = []
    
    risk_score = 0
    
    # ── Behavioral Analysis ──
    days_since_engagement = 0
    if act.last_engagement_date:
        try:
            last_date = datetime.strptime(act.last_engagement_date, "%Y-%m-%d")
            days_since_engagement = (datetime.now() - last_date).days
        except ValueError:
            days_since_engagement = 14

    if days_since_engagement > 14:
        behavioral_risks.append(f"Critical engagement gap: {days_since_engagement} days since last activity")
        risk_score += 25
    elif days_since_engagement > 7:
        behavioral_risks.append(f"Warning: {days_since_engagement} days since last buyer engagement")
        risk_score += 15

    if act.avg_response_time_hours > 72:
        behavioral_risks.append(f"Response latency critical: avg {act.avg_response_time_hours:.0f}h (threshold: 72h)")
        risk_score += 15
    elif act.avg_response_time_hours > 48:
        behavioral_risks.append(f"Response latency elevated: avg {act.avg_response_time_hours:.0f}h")
        risk_score += 8

    if act.meetings_held > 0 and act.meetings_scheduled == 0:
        behavioral_risks.append("Meeting frequency collapsed: past meetings held but none scheduled")
        risk_score += 12

    if act.emails_sent > 5 and act.emails_received < 2:
        behavioral_risks.append(f"Engagement asymmetry: {act.emails_sent} sent vs {act.emails_received} received")
        risk_score += 10

    if act.proposal_sent and act.proposal_viewed and not act.proposal_view_date:
        behavioral_risks.append("Proposal viewed but no follow-up response detected")
        risk_score += 10
    elif act.proposal_sent and not act.proposal_viewed:
        behavioral_risks.append("Proposal sent but NOT viewed — buyer disengagement signal")
        risk_score += 18

    # ── Psychological Analysis ──
    if sent.price_sensitivity_signals > 2:
        psychological_risks.append(f"Price sensitivity elevated: {sent.price_sensitivity_signals} signals detected in communications")
        risk_score += 10
    
    if sent.authority_avoidance_signals > 1:
        psychological_risks.append(f"Authority avoidance pattern: {sent.authority_avoidance_signals} instances of decision-deflection language")
        risk_score += 12

    if sent.hesitation_phrases > 3:
        psychological_risks.append(f"Hesitation language spike: {sent.hesitation_phrases} hedging/delay phrases detected")
        risk_score += 8

    if sent.enthusiasm_trend == "declining":
        psychological_risks.append("Emotional enthusiasm declining across recent interactions")
        risk_score += 10
    
    if sent.negative_ratio > 0.3:
        psychological_risks.append(f"Negative sentiment shift: {sent.negative_ratio*100:.0f}% of communications carry negative tone")
        risk_score += 15

    if sent.objection_count > 3:
        psychological_risks.append(f"Objection frequency spike: {sent.objection_count} objections logged")
        risk_score += 10

    # ── Structural Analysis ──
    has_economic_buyer = any(s.is_economic_buyer for s in deal.stakeholders)
    has_champion = any(s.is_champion for s in deal.stakeholders)
    engaged_count = len([s for s in deal.stakeholders if s.engagement_score > 40])
    
    stage_index = {"prospecting": 1, "qualification": 2, "proposal": 3, "negotiation": 4, "closing": 5}
    current_stage = stage_index.get(deal.deal_stage, 2)

    if not has_economic_buyer and current_stage >= 3:
        structural_risks.append("No economic buyer identified at proposal+ stage — deal structurally unsupported")
        risk_score += 20

    if not has_champion:
        structural_risks.append("No internal champion identified — deal lacks internal advocacy")
        risk_score += 12

    if len(deal.stakeholders) <= 1:
        structural_risks.append("Single-threaded deal: only 1 stakeholder engaged — high vulnerability")
        risk_score += 18
    
    if engaged_count < cp.typical_stakeholder_count * 0.5:
        structural_risks.append(f"Stakeholder gap: {engaged_count}/{cp.typical_stakeholder_count} expected stakeholders engaged")
        risk_score += 10

    exec_engaged = any(s for s in deal.stakeholders if "VP" in s.title or "C-" in s.title.upper() or "Director" in s.title or "Head" in s.title)
    if not exec_engaged and current_stage >= 3:
        structural_risks.append("No executive-level engagement detected at advanced deal stage")
        risk_score += 12

    # ── Timeline Risk ──
    cycle_ratio = deal.deal_age_days / max(cp.average_deal_cycle_days, 1)
    if cycle_ratio > 1.5:
        timeline_assessment = f"Critical: Deal age ({deal.deal_age_days}d) exceeds avg cycle ({cp.average_deal_cycle_days}d) by {((cycle_ratio-1)*100):.0f}%"
        risk_score += 15
    elif cycle_ratio > 1.1:
        timeline_assessment = f"Warning: Deal age ({deal.deal_age_days}d) approaching cycle limit ({cp.average_deal_cycle_days}d)"
        risk_score += 8
    else:
        timeline_assessment = f"Within range: Deal age ({deal.deal_age_days}d) vs avg cycle ({cp.average_deal_cycle_days}d)"

    # ── Rep Performance Adjustment ──
    if deal.rep_win_rate < cp.historical_close_rate * 0.7:
        risk_score += 5  # slight uncertainty bump

    # ── Competitive Threat ──
    if sent.competitor_mentions > 3:
        competitive_level = "High"
        risk_score += 12
    elif sent.competitor_mentions > 1:
        competitive_level = "Moderate"
        risk_score += 6
    elif sent.competitor_mentions > 0:
        competitive_level = "Low"
        risk_score += 3
    else:
        competitive_level = "None Detected"

    # ── Momentum Calculation ──
    positive_signals = (
        sent.positive_ratio * 25 +
        min(act.meetings_held, 5) * 5 +
        min(engaged_count, 5) * 5 +
        max(0, (48 - act.avg_response_time_hours) / 48) * 15
    )
    negative_signals = (
        days_since_engagement * 2 +
        sent.objection_count * 4 +
        min(days_since_engagement, 14) * 2 +
        sent.competitor_mentions * 5
    )
    momentum_raw = positive_signals - negative_signals

    if momentum_raw > 40:
        momentum = "Strong"
    elif momentum_raw > 20:
        momentum = "Moderate"
    elif momentum_raw > 0:
        momentum = "Weak"
    elif momentum_raw > -20:
        momentum = "Reversing"
    else:
        momentum = "Collapsed"

    # ── Final Scoring ──
    risk_score = min(risk_score, 100)
    
    if risk_score >= 75:
        risk_level = "Critical"
    elif risk_score >= 50:
        risk_level = "High"
    elif risk_score >= 30:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    base_close_prob = cp.historical_close_rate * 100
    close_probability = max(2, base_close_prob * (1 - risk_score / 120))
    thirty_day_failure = min(95, risk_score * 1.1)
    revenue_at_risk = deal.deal_value * (risk_score / 100)

    stakeholder_completeness = min(100, (len(deal.stakeholders) / max(cp.typical_stakeholder_count, 1)) * 100)

    # ── Generate Interventions ──
    if not has_economic_buyer and current_stage >= 3:
        interventions.append(InterventionItem(
            priority="Immediate",
            action=f"Identify and engage economic buyer through existing champion or stakeholder mapping; request introduction via {deal.stakeholders[0].name if deal.stakeholders else 'primary contact'}",
            role_owner="Account Executive + Sales Manager",
            deadline_recommendation="Within 48 hours"
        ))

    if days_since_engagement > 7:
        interventions.append(InterventionItem(
            priority="Immediate",
            action=f"Execute re-engagement sequence: send value-add content (ROI calculator, case study) to primary contact with specific CTA; if no response in 24h, escalate via phone + LinkedIn outreach",
            role_owner="Account Executive",
            deadline_recommendation="Within 24 hours"
        ))

    if len(deal.stakeholders) <= 1:
        interventions.append(InterventionItem(
            priority="High",
            action="Multi-thread the deal: identify 2-3 additional stakeholders via org chart research and request warm introductions; target both technical evaluator and business sponsor",
            role_owner="Account Executive + SDR",
            deadline_recommendation="Within 72 hours"
        ))

    if sent.competitor_mentions > 1:
        interventions.append(InterventionItem(
            priority="High",
            action=f"Deploy competitive displacement strategy: prepare battle card comparison, schedule {deal.deal_value:,.0f}-scale ROI presentation highlighting unique differentiators and switching cost analysis",
            role_owner="Account Executive + Solutions Engineer",
            deadline_recommendation="Within 5 business days"
        ))

    if sent.price_sensitivity_signals > 2:
        interventions.append(InterventionItem(
            priority="Medium",
            action=f"Schedule ROI alignment call within 48 hours including economic buyer; present quantified cost-of-delay analysis tailored to client's ${deal.deal_value:,.0f} deal scale",
            role_owner="Account Executive + Sales Engineer",
            deadline_recommendation="Within 48 hours"
        ))

    if act.proposal_sent and not act.proposal_viewed:
        interventions.append(InterventionItem(
            priority="Immediate",
            action="Re-send proposal via alternative channel (direct email + LinkedIn message) with executive summary video; confirm correct recipient and offer live walkthrough",
            role_owner="Account Executive",
            deadline_recommendation="Within 24 hours"
        ))

    if not interventions:
        interventions.append(InterventionItem(
            priority="Medium",
            action="Maintain current engagement cadence; schedule next touchpoint to reinforce value proposition and confirm timeline alignment",
            role_owner="Account Executive",
            deadline_recommendation="Within 1 week"
        ))

    # ── Coaching ──
    coaching_parts = []
    if len(deal.stakeholders) <= 1:
        coaching_parts.append("prioritize multi-threading strategy in all active deals")
    if days_since_engagement > 7:
        coaching_parts.append("implement structured follow-up cadence with no gap exceeding 5 business days")
    if deal.rep_win_rate < cp.historical_close_rate * 0.7:
        coaching_parts.append("review deal qualification criteria — potential pattern of advancing unqualified opportunities")
    if sent.objection_count > 3:
        coaching_parts.append("conduct objection handling workshop focused on reframing value over price")
    
    coaching = "; ".join(coaching_parts) if coaching_parts else "Rep performance within acceptable range. Continue current methodology."

    # ── Forecast ──
    if risk_score >= 75:
        forecast = f"Downgrade to Unlikely. Remove ${deal.deal_value:,.0f} from committed forecast. Move to upside/pipeline only."
    elif risk_score >= 50:
        forecast = f"Downgrade to Best Case. Reduce weighted forecast value by {risk_score}% (${revenue_at_risk:,.0f} at risk)."
    elif risk_score >= 30:
        forecast = f"Flag for review. Maintain in pipeline but apply {risk_score}% risk discount to weighted value."
    else:
        forecast = "Maintain current forecast position. Deal health indicators within acceptable parameters."

    return DealRiskOutput(
        deal_id=deal.deal_id,
        deal_name=deal.deal_name,
        overall_risk_score=risk_score,
        risk_level=risk_level,
        close_probability_percent=round(close_probability, 1),
        thirty_day_failure_probability=round(thirty_day_failure, 1),
        revenue_at_risk=round(revenue_at_risk, 2),
        momentum_classification=momentum,
        behavioral_risk_indicators=behavioral_risks,
        psychological_risk_indicators=psychological_risks,
        structural_risk_indicators=structural_risks,
        competitive_threat_level=competitive_level,
        stakeholder_completeness_percent=round(stakeholder_completeness, 1),
        timeline_risk_assessment=timeline_assessment,
        intervention_plan=interventions,
        sales_coaching_recommendation=coaching,
        forecast_adjustment_recommendation=forecast
    )


# ─── API Routes ────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "operational", "engine": "Sentinel AI v1.0"}

@app.post("/api/analyze", response_model=DealRiskOutput)
def analyze(deal: DealInput):
    try:
        return analyze_deal(deal)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/demo-deals")
def demo_deals():
    """Return sample deals for dashboard demo."""
    deals = [
        {
            "deal_id": "DEAL-4821",
            "deal_name": "Acme Corp — Enterprise Platform",
            "deal_value": 245000,
            "deal_stage": "negotiation",
            "deal_age_days": 62,
            "expected_close_date": "2026-03-15",
            "rep_name": "Sarah Chen",
            "rep_win_rate": 0.38,
            "company_profile": {"average_deal_cycle_days": 45, "typical_stakeholder_count": 4, "industry": "SaaS", "historical_close_rate": 0.32, "average_deal_value": 85000},
            "stakeholders": [
                {"name": "James Morton", "role": "Evaluator", "title": "IT Director", "engagement_score": 72, "last_activity_date": "2026-02-10", "is_economic_buyer": False, "is_champion": True},
                {"name": "Linda Zhao", "role": "Influencer", "title": "Product Manager", "engagement_score": 45, "last_activity_date": "2026-02-05", "is_economic_buyer": False, "is_champion": False}
            ],
            "activity": {"emails_sent": 14, "emails_received": 4, "meetings_held": 5, "meetings_scheduled": 0, "calls_completed": 3, "proposal_sent": True, "proposal_viewed": True, "proposal_view_date": None, "last_engagement_date": "2026-02-10", "avg_response_time_hours": 56},
            "sentiment": {"positive_ratio": 0.35, "negative_ratio": 0.25, "neutral_ratio": 0.40, "objection_count": 4, "competitor_mentions": 2, "price_sensitivity_signals": 3, "authority_avoidance_signals": 2, "hesitation_phrases": 5, "enthusiasm_trend": "declining"}
        },
        {
            "deal_id": "DEAL-5133",
            "deal_name": "GlobalTech — Data Analytics Suite",
            "deal_value": 128000,
            "deal_stage": "proposal",
            "deal_age_days": 28,
            "expected_close_date": "2026-04-01",
            "rep_name": "Marcus Rivera",
            "rep_win_rate": 0.41,
            "company_profile": {"average_deal_cycle_days": 45, "typical_stakeholder_count": 4, "industry": "FinTech", "historical_close_rate": 0.32, "average_deal_value": 85000},
            "stakeholders": [
                {"name": "Rachel Kim", "role": "Champion", "title": "VP Engineering", "engagement_score": 88, "last_activity_date": "2026-02-21", "is_economic_buyer": False, "is_champion": True},
                {"name": "David Park", "role": "Decision Maker", "title": "CTO", "engagement_score": 65, "last_activity_date": "2026-02-18", "is_economic_buyer": True, "is_champion": False},
                {"name": "Amy Liu", "role": "Evaluator", "title": "Sr. Data Engineer", "engagement_score": 71, "last_activity_date": "2026-02-20", "is_economic_buyer": False, "is_champion": False}
            ],
            "activity": {"emails_sent": 8, "emails_received": 6, "meetings_held": 4, "meetings_scheduled": 1, "calls_completed": 2, "proposal_sent": True, "proposal_viewed": True, "proposal_view_date": "2026-02-19", "last_engagement_date": "2026-02-21", "avg_response_time_hours": 18},
            "sentiment": {"positive_ratio": 0.6, "negative_ratio": 0.1, "neutral_ratio": 0.3, "objection_count": 1, "competitor_mentions": 0, "price_sensitivity_signals": 1, "authority_avoidance_signals": 0, "hesitation_phrases": 1, "enthusiasm_trend": "rising"}
        },
        {
            "deal_id": "DEAL-4907",
            "deal_name": "NovaCare — Patient Portal License",
            "deal_value": 89000,
            "deal_stage": "qualification",
            "deal_age_days": 51,
            "expected_close_date": "2026-03-30",
            "rep_name": "Jake Thompson",
            "rep_win_rate": 0.22,
            "company_profile": {"average_deal_cycle_days": 45, "typical_stakeholder_count": 4, "industry": "HealthTech", "historical_close_rate": 0.32, "average_deal_value": 85000},
            "stakeholders": [
                {"name": "Dr. Susan Patel", "role": "Evaluator", "title": "Chief Medical Officer", "engagement_score": 30, "last_activity_date": "2026-02-01", "is_economic_buyer": False, "is_champion": False}
            ],
            "activity": {"emails_sent": 11, "emails_received": 2, "meetings_held": 2, "meetings_scheduled": 0, "calls_completed": 1, "proposal_sent": False, "proposal_viewed": False, "proposal_view_date": None, "last_engagement_date": "2026-02-01", "avg_response_time_hours": 96},
            "sentiment": {"positive_ratio": 0.2, "negative_ratio": 0.35, "neutral_ratio": 0.45, "objection_count": 6, "competitor_mentions": 4, "price_sensitivity_signals": 4, "authority_avoidance_signals": 3, "hesitation_phrases": 7, "enthusiasm_trend": "declining"}
        },
        {
            "deal_id": "DEAL-5210",
            "deal_name": "Meridian Finance — Compliance Module",
            "deal_value": 175000,
            "deal_stage": "closing",
            "deal_age_days": 38,
            "expected_close_date": "2026-03-05",
            "rep_name": "Sarah Chen",
            "rep_win_rate": 0.38,
            "company_profile": {"average_deal_cycle_days": 45, "typical_stakeholder_count": 4, "industry": "Finance", "historical_close_rate": 0.32, "average_deal_value": 85000},
            "stakeholders": [
                {"name": "Robert Hayes", "role": "Decision Maker", "title": "CFO", "engagement_score": 82, "last_activity_date": "2026-02-22", "is_economic_buyer": True, "is_champion": False},
                {"name": "Natalie Wong", "role": "Champion", "title": "Head of Compliance", "engagement_score": 91, "last_activity_date": "2026-02-23", "is_economic_buyer": False, "is_champion": True},
                {"name": "Tom Bradley", "role": "Evaluator", "title": "IT Manager", "engagement_score": 68, "last_activity_date": "2026-02-20", "is_economic_buyer": False, "is_champion": False},
                {"name": "Lisa Chen", "role": "Influencer", "title": "Legal Counsel", "engagement_score": 55, "last_activity_date": "2026-02-19", "is_economic_buyer": False, "is_champion": False}
            ],
            "activity": {"emails_sent": 10, "emails_received": 9, "meetings_held": 6, "meetings_scheduled": 2, "calls_completed": 4, "proposal_sent": True, "proposal_viewed": True, "proposal_view_date": "2026-02-18", "last_engagement_date": "2026-02-23", "avg_response_time_hours": 8},
            "sentiment": {"positive_ratio": 0.7, "negative_ratio": 0.05, "neutral_ratio": 0.25, "objection_count": 0, "competitor_mentions": 0, "price_sensitivity_signals": 0, "authority_avoidance_signals": 0, "hesitation_phrases": 0, "enthusiasm_trend": "rising"}
        },
        {
            "deal_id": "DEAL-5089",
            "deal_name": "Apex Logistics — Fleet Tracking",
            "deal_value": 67000,
            "deal_stage": "proposal",
            "deal_age_days": 44,
            "expected_close_date": "2026-03-20",
            "rep_name": "Marcus Rivera",
            "rep_win_rate": 0.41,
            "company_profile": {"average_deal_cycle_days": 45, "typical_stakeholder_count": 4, "industry": "Logistics", "historical_close_rate": 0.32, "average_deal_value": 85000},
            "stakeholders": [
                {"name": "Kevin O'Brien", "role": "Evaluator", "title": "Operations Manager", "engagement_score": 58, "last_activity_date": "2026-02-15", "is_economic_buyer": False, "is_champion": True},
                {"name": "Sandra Mills", "role": "Influencer", "title": "Fleet Supervisor", "engagement_score": 42, "last_activity_date": "2026-02-12", "is_economic_buyer": False, "is_champion": False}
            ],
            "activity": {"emails_sent": 9, "emails_received": 3, "meetings_held": 3, "meetings_scheduled": 0, "calls_completed": 2, "proposal_sent": True, "proposal_viewed": False, "proposal_view_date": None, "last_engagement_date": "2026-02-15", "avg_response_time_hours": 64},
            "sentiment": {"positive_ratio": 0.3, "negative_ratio": 0.2, "neutral_ratio": 0.5, "objection_count": 3, "competitor_mentions": 3, "price_sensitivity_signals": 2, "authority_avoidance_signals": 1, "hesitation_phrases": 4, "enthusiasm_trend": "declining"}
        }
    ]
    # Analyze each deal and add display fields from input
    results = []
    for d in deals:
        deal_input = DealInput(**d)
        result = analyze_deal(deal_input)
        out = result.model_dump()
        out["rep_name"] = deal_input.rep_name
        out["deal_value"] = deal_input.deal_value
        out["deal_stage"] = deal_input.deal_stage
        results.append(out)
    return results


@app.post("/api/analyze-deals")
def analyze_deals(deals: list[DealInput]):
    """Accept a list of deal inputs; return risk analysis for each. Use this to load your own deals."""
    results = []
    for deal_input in deals:
        result = analyze_deal(deal_input)
        out = result.model_dump()
        out["rep_name"] = deal_input.rep_name
        out["deal_value"] = deal_input.deal_value
        out["deal_stage"] = deal_input.deal_stage
        results.append(out)
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
