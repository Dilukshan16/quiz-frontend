"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

const LETTERS = ["A", "B", "C", "D", "E"];

type Option = { id: string; option_text: string; order_index: number };
type Question = { id: string; question_text: string; explanation: string | null; options: Option[] };
type Session = { attemptId: string; title: string; total: number };
type Feedback = {
  isCorrect: boolean;
  msg: string;
  explanation: string | null;
  correctId: string | null;
  correctText: string | null;
  selectedId: string;
  remaining: number;
  isPrev?: boolean;
};

type OptionState = "idle" | "correct" | "wrong" | "reveal" | "dim";

function getOptionState(optId: string, feedback: Feedback | null, answered: boolean): OptionState {
  if (!answered || !feedback) return "idle";
  if (optId === feedback.selectedId) return feedback.isCorrect ? "correct" : "wrong";
  if (optId === feedback.correctId) return "reveal";
  return "dim";
}

const optionStyles: Record<OptionState, React.CSSProperties> = {
  idle: {},
  correct: { background: "rgba(0,200,83,.12)", borderColor: "#00C853" },
  wrong: { background: "rgba(245,0,87,.12)", borderColor: "#F50057" },
  reveal: { background: "rgba(0,200,83,.08)", borderColor: "rgba(0,200,83,.5)" },
  dim: { opacity: 0.3 },
};

export default function QuizPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [progress, setProgress] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [booting, setBooting] = useState(true);
  const [navBusy, setNavBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Boot: start quiz session
  useEffect(() => {
    const quizId = sessionStorage.getItem("currentQuizId");
    if (!quizId) { router.replace("/"); return; }

    api.startQuiz(quizId)
      .then((data: any) => {
        const d = data.data;
        setSession({ attemptId: d.attempt_id, title: d.quiz_title, total: d.total_questions });
        sessionStorage.setItem("currentAttemptId", d.attempt_id);
        setQuestion(d.current_question);
        setQIndex(0);
        setBooting(false);
      })
      .catch((err: Error) => { setError(err.message); setBooting(false); });
  }, [router]);

  // Submit answer
  const handleAnswer = useCallback(async (optionId: string) => {
    if (answered || !session || !question) return;
    setAnswered(true);
    try {
      const data: any = await api.submitAnswer(session.attemptId, question.id, optionId);
      const r = data.data;
      setScore(r.score);
      setAnsweredCount(r.answered_count);
      setProgress(r.progress_percentage);
      setFeedback({
        isCorrect: r.is_correct,
        msg: r.feedback_message,
        explanation: r.explanation,
        correctId: r.correct_option_id,
        correctText: r.correct_option_text,
        selectedId: optionId,
        remaining: r.remaining_count,
      });
    } catch (err: any) {
      setAnswered(false);
      alert(err.message);
    }
  }, [answered, session, question]);

  // Next question
  const handleNext = useCallback(async () => {
    if (navBusy || !session) return;
    setNavBusy(true);
    try {
      const data: any = await api.nextQuestion(session.attemptId);
      if (data.is_finished) { router.push("/results"); return; }
      const d = data.data;
      setQuestion(d.current_question);
      setQIndex(d.current_question_index);
      setAnswered(false);
      setFeedback(null);
      setCardKey((k) => k + 1);
    } catch (err: any) { alert(err.message); }
    finally { setNavBusy(false); }
  }, [navBusy, session, router]);

  // Previous question
  const handlePrev = useCallback(async () => {
    if (navBusy || !session || qIndex === 0) return;
    setNavBusy(true);
    try {
      const data: any = await api.prevQuestion(session.attemptId);
      const d = data.data;
      setQuestion(d.current_question);
      setQIndex(d.current_question_index);
      setFeedback(null);
      if (d.previously_selected_option) {
        const p = d.previously_selected_option;
        setAnswered(true);
        setFeedback({ isCorrect: p.was_correct, msg: p.was_correct ? "✓ Correct!" : "✗ Wrong", explanation: null, correctId: null, correctText: null, selectedId: p.option_id, remaining: 0, isPrev: true });
      } else { setAnswered(false); }
      setCardKey((k) => k + 1);
    } catch { /* already at first */ }
    finally { setNavBusy(false); }
  }, [navBusy, session, qIndex]);

  if (booting) return <Centered><div className="spinner lg" /><p style={{ color: "var(--muted)", fontWeight: 600 }}>Starting quiz...</p></Centered>;
  if (error) return <Centered><p style={{ color: "#F50057", fontWeight: 700, textAlign: "center", maxWidth: 320 }}>{error}</p><button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => router.push("/")}>← Go Home</button></Centered>;

  const total = session?.total || 0;
  const isLast = feedback !== null && feedback.remaining === 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", position: "relative" }}>
      <div className="orbs">
        <div className="orb" style={{ width: 300, height: 300, background: "#651FFF", top: "5%", right: "-6%", opacity: 0.12, animationDuration: "20s" }} />
        <div className="orb" style={{ width: 240, height: 240, background: "#F50057", bottom: "10%", left: "-5%", opacity: 0.1, animationDuration: "25s", animationDelay: "6s" }} />
      </div>

      {/* Header */}
      <header style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", background: "rgba(30,0,53,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => router.push("/")}>← Home</button>
        <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 700, color: "var(--text)", flex: 1, textAlign: "center", padding: "0 12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {session?.title}
        </p>
        <div style={{ background: "rgba(255,202,40,.15)", border: "1px solid rgba(255,202,40,.3)", color: "#FFCA28", fontWeight: 700, fontSize: 14, padding: "6px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>
          ⭐ {score} pts
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ position: "relative", zIndex: 1, padding: "10px 24px 0", background: "rgba(30,0,53,0.6)" }}>
        <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#FF6D00,#F50057,#651FFF)", backgroundSize: "200% auto", borderRadius: 6, width: `${progress}%`, transition: "width .65s cubic-bezier(.34,1.56,.64,1)", animation: "progressShine 3s linear infinite" }} />
        </div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textAlign: "right", padding: "4px 0 8px" }}>
          {answeredCount}/{total} answered
        </p>
      </div>

      {/* Main */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Question card */}
        <div key={cardKey} className="glass-card anim-fadeUp" style={{ padding: "30px 28px 24px", marginBottom: 18 }}>
          <span style={{ display: "inline-block", marginBottom: 14, background: "rgba(101,31,255,.25)", border: "1px solid rgba(101,31,255,.4)", color: "#C5B8FF", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Question {qIndex + 1} <span style={{ opacity: .6 }}>of {total}</span>
          </span>
          <h2 style={{ fontSize: "clamp(18px,3.5vw,26px)", fontWeight: 700, color: "var(--text)", lineHeight: 1.4, marginBottom: 28 }}>
            {question?.question_text}
          </h2>

          {/* Options grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {question?.options.map((opt, i) => {
              const state = getOptionState(opt.id, feedback, answered);
              return (
                <button
                  key={opt.id}
                  className="anim-fadeUp"
                  disabled={answered}
                  onClick={() => handleAnswer(opt.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 14, width: "100%",
                    background: "rgba(255,255,255,0.05)", border: "1.5px solid var(--border)",
                    textAlign: "left", cursor: answered ? "default" : "pointer",
                    transition: "all .15s", animationDelay: `${i * 55}ms`,
                    animation: state === "wrong" ? "shake .4s ease" : state === "correct" ? "correctPulse .4s ease" : undefined,
                    ...optionStyles[state],
                  }}
                >
                  <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: state === "correct" || state === "reveal" ? "#00C853" : state === "wrong" ? "#F50057" : "rgba(255,255,255,.08)", color: state === "correct" || state === "reveal" ? "#001a0a" : state === "wrong" ? "#fff" : "var(--muted)", fontSize: 12, fontWeight: 800 }}>
                    {LETTERS[i]}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: state === "correct" || state === "reveal" ? "#B9F6CA" : state === "wrong" ? "#FF80AB" : "var(--text)", lineHeight: 1.3 }}>
                    {opt.option_text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="anim-fadeUp" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 20px", borderRadius: 16, marginBottom: 16, background: feedback.isCorrect ? "rgba(0,200,83,.1)" : "rgba(245,0,87,.1)", border: `1px solid ${feedback.isCorrect ? "rgba(0,200,83,.3)" : "rgba(245,0,87,.3)"}` }}>
            <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{feedback.isCorrect ? "🎉" : "😅"}</span>
            <div>
              <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, marginBottom: 4, color: feedback.isCorrect ? "#69F0AE" : "#FF80AB" }}>{feedback.msg}</p>
              {feedback.explanation && <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, fontWeight: 500 }}>{feedback.explanation}</p>}
              {!feedback.isCorrect && !feedback.explanation && feedback.correctText && (
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, fontWeight: 500 }}>Correct answer: <strong style={{ color: "var(--text)" }}>{feedback.correctText}</strong></p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        {answered && (
          <div className="anim-fadeIn" style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            {qIndex > 0 && (
              <button className="btn btn-ghost" onClick={handlePrev} disabled={navBusy}>← Back</button>
            )}
            <button
              className={`btn ${isLast ? "btn-success" : "btn-fire"}`}
              onClick={handleNext}
              disabled={navBusy}
              style={{ flex: 1, maxWidth: 240 }}
            >
              {navBusy ? "..." : isLast ? "See Results 🏆" : "Next →"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 20, padding: 24 }}>
      {children}
    </div>
  );
}