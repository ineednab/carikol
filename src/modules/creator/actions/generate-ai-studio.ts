"use server"
export type AIObservation = { text: string; evidence: string }
export type AIStrength    = { label: string; evidence: string }
export type AIOpportunity = { label: string }

export type AIFacts = {
  profile: {
    followers: number
    tier:      string
  }
  activity: {
    videos90d:           number
    postingFreqPerWeek:  number
    activeWeeks90d:      number
    totalWeeks:          number
    activityLevel:       string
    evidence:            string[]
  }
  performance: {
    avgViews:         number
    avgEngagement:    number
    top5AvgViews:     number | null
    performanceRatio: number | null
  }
  content: {
    categories: { name: string; pct: number }[]
  }
  brandFit: { category: string; score: number; reason: string }[]
  rateCard: {
    basePriceMin: number
    basePriceMax: number
    confidence:   string
    factors:      string[]
  }
  dataQuality: {
    insufficient:    boolean
    videosAnalyzed:  number
  }
}

export type AIStudioResult = {
  facts: AIFacts
  ai: {
    activitySummary:     string
    contentSummary:      string
    performanceSummary:  string
    rateCardExplanation: string
    observations:        AIObservation[]
    strengths:           AIStrength[]
    opportunities:       AIOpportunity[]
  }
  generatedAt: string
}

export async function generateAIStudioAction(): Promise<
  { success: true; data: AIStudioResult } | { success: false; error: string }
> {
  return { success: false, error: "AI Studio akan diperbarui segera." }
}
