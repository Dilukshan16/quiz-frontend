import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizZap! 🎉",
  description: "Fun interactive quizzes for kids",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behaviour="smooth">
      <body>{children}</body>
    </html>
  );
}
