import OpenAI from "openai"

export const ai = new OpenAI({
  apiKey: process.env.SUMOPOD_API_KEY!,
  baseURL: "https://ai.sumopod.com/v1",
})

export const AI_MODEL = "deepseek-v4-pro"

export async function generateJSON<T>(prompt: string, maxTokens = 2048): Promise<T | null> {
  const message = await ai.chat.completions.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  })
  const text = message.choices[0].message.content ?? ""
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  return JSON.parse(match[0]) as T
}

export async function generateJSONArray<T>(prompt: string, maxTokens = 512): Promise<T[] | null> {
  const message = await ai.chat.completions.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  })
  const text = message.choices[0].message.content ?? ""
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return null
  return JSON.parse(match[0]) as T[]
}
