export type MenopauseMLResponse = {
  stage: string;
  confidence: number;
  probabilities: Record<string, number>;
};

export async function predictMenopauseML(payload: any): Promise<MenopauseMLResponse> {
  const res = await fetch("http://localhost:8000/predict-menopause", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("ML API failed");
  }

  return res.json();
}
