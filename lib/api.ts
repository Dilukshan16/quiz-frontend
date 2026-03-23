const BASE = "/api";

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request failed");
  return json;
}

export const api = {
  // ── Quizzes ──────────────────────────────────────────
  getQuizzes: () => req<any>("/quizzes"),
  getQuiz: (id: string) => req<any>(`/quizzes/${id}`),

  // ── Sessions ─────────────────────────────────────────
  startQuiz: (quizId: string, userId: string | null = null) =>
    req<any>("/sessions/start", {
      method: "POST",
      body: JSON.stringify({
        quiz_id: quizId,
        ...(userId && { user_id: userId }),
      }),
    }),

  submitAnswer: (attemptId: string, questionId: string, optionId: string) =>
    req<any>(`/sessions/${attemptId}/answer`, {
      method: "POST",
      body: JSON.stringify({
        question_id: questionId,
        selected_option_id: optionId,
      }),
    }),

  nextQuestion: (attemptId: string) =>
    req<any>(`/sessions/${attemptId}/next`, { method: "POST" }),

  prevQuestion: (attemptId: string) =>
    req<any>(`/sessions/${attemptId}/prev`, { method: "POST" }),

  getResults: (attemptId: string) =>
    req<any>(`/sessions/${attemptId}/results`),

  getProgress: (attemptId: string) =>
    req<any>(`/progress/${attemptId}`),
};