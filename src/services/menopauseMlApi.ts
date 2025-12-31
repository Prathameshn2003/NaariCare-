export type MenopauseMLResponse = {
  stage: string;
  confidence: number;
  probabilities: Record<string, number>;
};

// ✅ SAFE API URL (ENV + FALLBACK)
const MENOPAUSE_API_URL =
  import.meta.env.VITE_MENOPAUSE_API_URL ||
  "https://menopause-ml-production.up.railway.app";

export async function predictMenopauseML(
  payload: any
): Promise<MenopauseMLResponse> {
  console.log("Calling Menopause API:", MENOPAUSE_API_URL);

  const res = await fetch(`${MENOPAUSE_API_URL}/predict-menopause`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ML API failed (${res.status}): ${text}`);
  }

  return res.json();
}
