"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

const EMOJI: Record<string, string> = {
  science: "🔬", math: "🔢", animals: "🐾", geography: "🌍",
  history: "📜", sports: "⚽", music: "🎵", general: "🎯",
  space: "🚀", nature: "🌿", food: "🍕",
};

const GRADIENTS = [
  "linear-gradient(135deg,#FF6D00,#F50057)",
  "linear-gradient(135deg,#651FFF,#00B0FF)",
  "linear-gradient(135deg,#00B0FF,#1DE9B6)",
  "linear-gradient(135deg,#F50057,#651FFF)",
  "linear-gradient(135deg,#1DE9B6,#76FF03)",
  "linear-gradient(135deg,#FFCA28,#FF6D00)",
];

type Quiz = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  total_questions: number;
};

type Step = "name" | "loading" | "quizzes" | "error";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [step, setStep] = useState<Step>("name");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [errMsg, setErrMsg] = useState("");

  async function handleNameSubmit() {
    if (!name.trim()) return;
    sessionStorage.setItem("playerName", name.trim());
    setStep("loading");
    try {
      const data = await api.getQuizzes();
      setQuizzes(data.data || []);
      setStep("quizzes");
    } catch {
      setErrMsg(
        "Cannot reach the backend. Make sure quiz-backend is running on port 3000."
      );
      setStep("error");
    }
  }

  function handlePickQuiz(quizId: string) {
    sessionStorage.setItem("currentQuizId", quizId);
    router.push("/quiz");
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background orbs */}
      <div className="orbs">
        <div className="orb" style={{ width: 500, height: 500, background: "#651FFF", top: "-15%", left: "-10%", animationDuration: "18s" }} />
        <div className="orb" style={{ width: 400, height: 400, background: "#F50057", top: "40%", right: "-8%", animationDuration: "22s", animationDelay: "4s" }} />
        <div className="orb" style={{ width: 350, height: 350, background: "#FF6D00", bottom: "-10%", left: "20%", animationDuration: "26s", animationDelay: "8s" }} />
      </div>

      {/* Header */}
      <header style={{ position: "relative", zIndex: 10, padding: "22px 36px", display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 32 }}>⚡</span>
          <span style={{
            fontFamily: "'Baloo 2', cursive", fontSize: 28, fontWeight: 800,
            background: "linear-gradient(135deg, #FFCA28, #FF6D00)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>QuizZap!</span>
        </div>
      </header>

      {/* Main */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "10px 24px 80px" }}>

        {/* Name entry */}
        {step === "name" && (
          <div className="anim-fadeUp" style={{ textAlign: "center", paddingTop: 24 }}>
            <div style={{
              display: "inline-block", marginBottom: 20,
              background: "rgba(255,202,40,.15)", color: "#FFCA28",
              fontSize: 13, fontWeight: 700, padding: "6px 18px",
              borderRadius: 20, border: "1px solid rgba(255,202,40,.3)",
              letterSpacing: ".08em", textTransform: "uppercase",
            }}>🎮 Quiz Time!</div>

            <h1 style={{ fontSize: "clamp(38px, 9vw, 76px)", fontWeight: 800, color: "var(--text)", marginBottom: 14 }}>
              Think You Know<br />
              <span style={{
                background: "linear-gradient(135deg, #FF6D00, #F50057)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Everything?</span>
            </h1>
            <p style={{ fontSize: 18, color: "var(--muted)", fontWeight: 500, marginBottom: 44 }}>
              Enter your name and prove it! 🚀
            </p>

            <div className="glass-card" style={{ maxWidth: 520, margin: "0 auto", padding: "36px 40px", border: "1px solid rgba(255,202,40,.25)" }}>
              <label style={{ display: "block", fontSize: 15, fontWeight: 600, color: "var(--muted)", marginBottom: 14, textAlign: "left" }}>
                What should we call you?
              </label>
              <input
                type="text"
                placeholder="Your name..."
                maxLength={20}
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                style={{
                  width: "100%", padding: "16px 20px", marginBottom: 16,
                  background: "rgba(255,255,255,0.06)", border: "1.5px solid var(--border)",
                  borderRadius: 12, color: "var(--text)", fontSize: 18, fontWeight: 600, outline: "none",
                }}
              />
              <button
                className="btn btn-fire"
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                style={{ width: "100%", padding: 16, fontSize: 16, borderRadius: 12 }}
              >
                Start Playing →
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {step === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 20 }}>
            <div className="spinner lg" />
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--muted)" }}>Fetching quizzes...</p>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="glass-card anim-fadeUp" style={{ maxWidth: 480, margin: "60px auto", padding: 36, textAlign: "center" }}>
            <span style={{ fontSize: 52, display: "block", marginBottom: 16 }}>😵</span>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, lineHeight: 1.6 }}>{errMsg}</p>
            <button className="btn btn-ghost" onClick={() => setStep("name")}>← Try Again</button>
          </div>
        )}

        {/* Quiz list */}
        {step === "quizzes" && (
          <div className="anim-fadeIn">
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 30, fontWeight: 700, color: "var(--text)" }}>Hey {name}! 👋</h2>
              <p style={{ fontSize: 15, color: "var(--muted)", fontWeight: 500, marginTop: 2 }}>Pick a quiz and let's go!</p>
            </div>

            {quizzes.length === 0 ? (
              <div className="glass-card" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
                No quizzes yet. Add some via the backend API.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
                {quizzes.map((quiz, i) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    gradient={GRADIENTS[i % GRADIENTS.length]}
                    delay={i * 70}
                    onPlay={() => handlePickQuiz(quiz.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function QuizCard({ quiz, gradient, delay, onPlay }: {
  quiz: Quiz;
  gradient: string;
  delay: number;
  onPlay: () => void;
}) {
  const emoji = EMOJI[quiz.category?.toLowerCase()] || "📚";
  const diff = quiz.difficulty || "easy";

  return (
    <div
      className="anim-fadeUp"
      style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 22, overflow: "hidden", padding: "0 22px 22px",
        transition: "transform .2s, box-shadow .2s", cursor: "pointer",
        display: "flex", flexDirection: "column", animationDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
    >
      <div style={{ height: 6, margin: "0 -22px 20px", background: gradient }} />
      <div style={{ fontSize: 42, marginBottom: 10 }}>{emoji}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{quiz.title}</h3>
      <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, marginBottom: 14, flex: 1 }}>
        {quiz.description || "Test your knowledge!"}
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <span className="tag tag-cat">❓ {quiz.total_questions} Qs</span>
        <span className={`tag tag-${diff}`}>{diff}</span>
        {quiz.category && <span className="tag tag-cat">{quiz.category}</span>}
      </div>
      <button
        className="btn btn-fire"
        onClick={onPlay}
        style={{ width: "100%", padding: 12, fontSize: 14, borderRadius: 12, background: gradient, boxShadow: "none" }}
      >
        Play Now →
      </button>
    </div>
  );
}