"use server"
export type RateCardItem = { type: string; description: string; price: number; priceFormatted: string; notes: string; reasons: string[] }
export type RateCardResult = { items: RateCardItem[]; summary: string; positioning: string }
export async function generateRateCardAction(): Promise<
  { success: true; data: RateCardResult } | { success: false; error: string }
> {
  return { success: false, error: "Rate card akan diperbarui segera." }
}
