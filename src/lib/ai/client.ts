import OpenAI from "openai"

export const ai = new OpenAI({
  apiKey:  process.env.SUMOPOD_API_KEY!,
  baseURL: "https://ai.sumopod.com/v1",
})

export const AI_MODEL = "deepseek-v4-pro"

// Strip markdown code fences that some models wrap around JSON
function extractJSON(text: string): string | null {
  const stripped = text.replace(/```(?:json)?\n?/gi, "").replace(/```/g, "")
  const match    = stripped.match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

function extractJSONArray(text: string): string | null {
  const stripped = text.replace(/```(?:json)?\n?/gi, "").replace(/```/g, "")
  const match    = stripped.match(/\[[\s\S]*\]/)
  return match ? match[0] : null
}

async function callAI(prompt: string, maxTokens: number): Promise<string> {
  const res = await ai.chat.completions.create({
    model:      AI_MODEL,
    max_tokens: maxTokens,
    messages:   [{ role: "user", content: prompt }],
  })
  return res.choices[0].message.content ?? ""
}

export async function generateJSON<T>(
  prompt:    string,
  maxTokens: number = 2048,
  retries:   number = 1,
): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const text = await callAI(prompt, maxTokens)
      const raw  = extractJSON(text)
      if (!raw) continue
      return JSON.parse(raw) as T
    } catch {
      if (attempt === retries) return null
    }
  }
  return null
}

export async function generateJSONArray<T>(
  prompt:    string,
  maxTokens: number = 512,
  retries:   number = 1,
): Promise<T[] | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const text = await callAI(prompt, maxTokens)
      const raw  = extractJSONArray(text)
      if (!raw) continue
      return JSON.parse(raw) as T[]
    } catch {
      if (attempt === retries) return null
    }
  }
  return null
}
