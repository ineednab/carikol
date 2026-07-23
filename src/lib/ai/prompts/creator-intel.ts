import type { CreatorFacts } from "@/lib/creator-facts"

export function buildCreatorIntelPrompt(facts: CreatorFacts): string {
  const context = {
    profile:     facts.profile,
    activity:    { ...facts.activity,    evidence: facts.activity.evidence },
    performance: { ...facts.performance, evidence: facts.performance.evidence },
    content:     { ...facts.content,     evidence: facts.content.evidence },
    brandFit:    facts.brandFit,
    rateCard:    facts.rateCard,
    facts:       facts.facts,
    dataQuality: facts.dataQuality,
  }

  return `You are an analytics writer for CariKOL, a creator platform.

Your ONLY job is to write clear, human-readable explanations of the pre-computed data below.

STRICT RULES:
1. Do NOT invent facts. Every claim must come from the data provided.
2. Do NOT mention audience demographics (gender, age, location) — this data is not available from TikTok Login Kit.
3. Do NOT guess brand preferences beyond what content categories explicitly show.
4. Do NOT use hedge words ("likely", "probably", "suggests") for values that are already computed.
5. If a value is null or 0, skip it — do not fill in the gap with assumptions.
6. Each observation MUST cite one item from the facts array verbatim.
7. Strengths must have direct numerical evidence. No personality assessments.
8. Opportunities are gaps in data or profile completeness — not advice.
9. Write in English. Be concise.

DATA (pre-computed, do not modify):
${JSON.stringify(context, null, 2)}

Return valid JSON only. No markdown, no explanation outside the JSON.

{
  "activitySummary": "One sentence about posting habit. Must cite posting frequency or videos90d.",
  "contentSummary": "One sentence about content focus. Must cite top category and percentage. If no categories found, say 'Content categories could not be determined from available video titles.'",
  "performanceSummary": "One sentence about views or engagement. Must cite avgViews or avgEngagement.",
  "rateCardExplanation": "One sentence explaining why the price range is basePriceMin–basePriceMax. Cite tier and avgViews.",
  "observations": [
    {
      "text": "Observation sentence — explain one pattern from the data.",
      "evidence": "Exact string from facts[] array that supports this."
    }
  ],
  "strengths": [
    {
      "label": "Short label (2-4 words)",
      "evidence": "Specific number or metric from the data"
    }
  ],
  "opportunities": [
    {
      "label": "Short label describing a missing or incomplete data point"
    }
  ]
}

Maximum: 3 observations, 3 strengths, 3 opportunities.
If dataQuality.insufficient is true, limit observations to 1 and note limited data.`
}
