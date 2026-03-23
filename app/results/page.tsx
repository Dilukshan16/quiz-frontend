"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

type ReviewItem = {
  question_text: string;
  selected_option_text: string;
  correct_option_text: string;
  is_correct: number;
  explanation: string | null;
};

type Results = {
  completion_percentage: number;
  correct_answers: number;
  incorrect_answers: number;
  score: number;
  stars: number;
  badge: string;
  encouraging_message: string;
  answer_review: ReviewItem[];
};

function getTheme(pct: number) {
  if (pct === 100) return { icon: "🏆", label: "Perfect Score!" };
  if (pct >= 70)   return { icon: "🎉", label: "Awesome Job!" };
  if (pct >= 40)   return { icon: "👍", label: "Good Try!" };
  return               { icon: "💪", label: "Keep Practising!" };
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starsShown, setStarsShown] = useState(0);
  const [name, setName] = useState("Champion");

  useEffect(() => {
    setName(sessionStorage.getItem("playerName") || "Champion");
    const attemptId = sessionStorage.getItem("currentAttemptId");
    if (!attemptId) { router.replace("/"); return; }

    api.getResults(attemptId)
      .then((data: any) => {
        setResults(data.data);
        setLoading(false);
        setTimeout(() => setStarsShown(data.data.stars || 1), 700);
      })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  }, [router]);

  function handleRetry() {
    sessionStorage.removeItem("currentAttemptId");
    router.push("/quiz");
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 20 }}>
      <div className="spinner lg" />
      <p style={{ color: "var(--muted)", fontWeight: 600 }}>Calculating results...</p>
    </div>
  );

  if (error || !results) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 20, padding: 24, textAlign: "center" }}>
      <p style={{ color: "#F50057", fontWeight: 700, maxWidth: 300 }}>{error}</p>
      <button className="btn btn-ghost" onClick={() => router.push("/")}>← Home</button>
    </div>
  );

  const pct = results.completion_percentage;
  const { icon, label } = getTheme(pct);

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "linear-gradient(160deg, #0A0015 0%, #12001F 50%, #1A0030 100%)" }}>
      <div className="orbs">
        <div className="orb" style={{ width: 400, height: 400, background: "#FFCA28", top: "-10%", left: "-8%", opacity: 0.1, animationDuration: "20s" }} />
        <div className="orb" style={{ width: 350, height: 350, background: "#651FFF", bottom: "-8%", right: "-6%", opacity: 0.12, animationDuration: "24s", animationDelay: "5s" }} />
        <div className="orb" style={{ width: 280, height: 280, background: "#F50057", top: "40%", left: "30%", opacity: 0.08, animationDuration: "30s", animationDelay: "10s" }} />
      </div>

      <main style={{ position: "relative", zIndex: 1, maxWidth: 660, margin: "0 auto", padding: "28px 20px 60px" }}>
        <div className="glass-card anim-fadeUp" style={{ padding: "40px 36px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>

          {/* Confetti */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, fontSize: 22, marginBottom: 16 }}>
            {"🎊 ⭐ 🎉 ✨ 🏆 🌟".split(" ").map((e, i) => (
              <span key={i} className="anim-popIn" style={{ animationDelay: `${i * 80}ms` }}>{e}</span>
            ))}
          </div>

          {/* icons */}
          <div className="anim-popIn" style={{ fontSize: 76, textAlign: "center", lineHeight: 1, marginBottom: 10, animationDelay: "200ms" }}>
            {icon}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 42, fontWeight: 800, textAlign: "center", background: "linear-gradient(135deg,#FFCA28,#FF6D00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>
            {label}
          </h1>
          <p style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#C5B8FF", marginBottom: 6 }}>
            Well done, {name}!
          </p>
          {results.encouraging_message && (
            <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)", marginBottom: 24, fontWeight: 500 }}>
              {results.encouraging_message}
            </p>
          )}

          {/* Stars */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 18 }}>
            {[1, 2, 3].map((n) => (
              <span key={n} style={{
                fontSize: 50, opacity: n <= starsShown ? 1 : 0.2,
                filter: n <= starsShown ? "none" : "grayscale(1)",
                animation: n <= starsShown ? `starPop .5s ease ${0.7 + n * 0.28}s both` : "none",
                display: "inline-block",
              }}>
                {n <= starsShown ? "⭐" : "☆"}
              </span>
            ))}
          </div>

          {/* Badge */}
          <div style={{ background: "linear-gradient(135deg,#FFCA28,#FF6D00)", color: "#200800", fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 800, padding: "10px 28px", borderRadius: 30, textAlign: "center", display: "block", width: "fit-content", margin: "0 auto 28px", boxShadow: "0 6px 24px rgba(255,109,0,.35)" }}>
            {results.badge}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Correct",  value: results.correct_answers,  color: "#00C853" },
              { label: "Wrong",    value: results.incorrect_answers, color: "#F50057" },
              { label: "Score",    value: results.score,             color: "#FF6D00" },
              { label: "Accuracy", value: `${pct}%`,                 color: "#651FFF" },
            ].map((s) => (
              <div key={s.label} style={{ borderRadius: 16, padding: "18px 14px", textAlign: "center", border: `1px solid ${s.color}33`, background: "rgba(255,255,255,.04)" }}>
                <span style={{ display: "block", fontFamily: "'Baloo 2',cursive", fontSize: 38, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Answer review */}
          {results.answer_review?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Answer Review</h3>
              {results.answer_review.map((a, i) => (
                <div key={i} style={{ borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: `1px solid ${a.is_correct ? "rgba(0,200,83,.25)" : "rgba(245,0,87,.25)"}`, background: a.is_correct ? "rgba(0,200,83,.07)" : "rgba(245,0,87,.07)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 7, lineHeight: 1.45 }}>{a.question_text}</p>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    <span style={{ color: a.is_correct ? "#69F0AE" : "#FF80AB" }}>
                      {a.is_correct ? "✓" : "✗"} You: {a.selected_option_text}
                    </span>
                    {!a.is_correct && (
                      <span style={{ color: "#69F0AE" }}>✓ Correct: {a.correct_option_text}</span>
                    )}
                  </div>
                  {a.explanation && (
                    <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>{a.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" style={{ flex: 1, padding: 16, fontSize: 15 }} onClick={() => router.push("/")}>🏠 Home</button>
            <button className="btn btn-fire" style={{ flex: 1, padding: 16, fontSize: 15 }} onClick={handleRetry}>🔄 Try Again</button>
          </div>

        </div>
      </main>
    </div>
  );
}