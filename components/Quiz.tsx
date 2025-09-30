'use client';

import { useState, useEffect } from 'react';
import { useStore, Question } from '@/lib/store';

interface QuizProps {
  onComplete: () => void;
}

export default function Quiz({ onComplete }: QuizProps) {
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentDocument = useStore((state) => state.currentDocument);
  const questions = useStore((state) => state.questions);
  const setQuestions = useStore((state) => state.setQuestions);
  const setTestResult = useStore((state) => state.setTestResult);

  useEffect(() => {
    if (currentDocument && questions.length === 0) {
      generateQuestions();
    }
  }, [currentDocument]);

  const generateQuestions = async () => {
    if (!currentDocument) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: currentDocument.summary,
          content: currentDocument.content,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const { questions } = await response.json();
      setQuestions(questions);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (showFeedback) return; // Prevent changing answer after feedback is shown

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowFeedback(selectedAnswers[questions[currentQuestionIndex - 1].id] !== undefined);
    }
  };

  const handleSubmit = () => {
    const incorrectQuestions = questions
      .filter((q) => selectedAnswers[q.id] !== q.correctAnswer)
      .map((q) => q.id);

    const score = questions.length - incorrectQuestions.length;

    const result = {
      documentId: currentDocument!.id,
      score,
      totalQuestions: questions.length,
      incorrectQuestions,
      completedAt: Date.now(),
    };

    setTestResult(result);
    setShowResults(true);
  };

  const handleContinueToFlashcards = () => {
    onComplete();
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-white rounded-2xl p-12 shadow-2xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center text-3xl">✍️</div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-2">Creating your personalized test...</p>
          <p className="text-gray-600">AI is crafting questions just for you ✨</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to generate questions. Please try again.
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = questions.length - questions.filter((q) => selectedAnswers[q.id] !== q.correctAnswer).length;
    const percentage = Math.round((score / questions.length) * 100);
    const incorrectTopics = questions
      .filter((q) => selectedAnswers[q.id] !== q.correctAnswer)
      .map((q) => q.topic);

    const getMessage = () => {
      if (percentage === 100) return { emoji: '🌟', text: 'Perfect Score!', subtext: 'You\'re a learning superstar!' };
      if (percentage >= 80) return { emoji: '🎉', text: 'Excellent Work!', subtext: 'You\'re doing amazing!' };
      if (percentage >= 60) return { emoji: '👍', text: 'Good Job!', subtext: 'Keep up the great work!' };
      return { emoji: '💪', text: 'Keep Going!', subtext: 'Every expert was once a beginner!' };
    };

    const message = getMessage();

    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-10 border border-blue-100">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4 animate-bounce">{message.emoji}</div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {message.text}
            </h2>
            <p className="text-lg text-gray-600">{message.subtext}</p>
          </div>

          <div className="mb-10 text-center bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-7xl font-black bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">
              {percentage}%
            </div>
            <p className="text-2xl text-gray-700 font-semibold">
              {score} out of {questions.length} correct
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-teal-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {incorrectTopics.length > 0 && (
            <div className="mb-8 bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📚</span> Areas to Master:
              </h3>
              <ul className="space-y-3">
                {[...new Set(incorrectTopics)].map((topic, index) => (
                  <li key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 font-medium">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4 justify-center pt-6 border-t-2 border-blue-100">
            {incorrectTopics.length > 0 ? (
              <button
                onClick={handleContinueToFlashcards}
                className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <span>🎯 Review with Flashcards</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            ) : (
              <div className="text-center bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-8 border-2 border-green-200">
                <p className="text-3xl text-green-600 font-bold mb-2">Perfect Score! 🎉</p>
                <p className="text-gray-600 text-lg">You've completely mastered this content!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestion.id] !== undefined;
  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);
  const userAnswer = selectedAnswers[currentQuestion.id];
  const isCorrect = userAnswer === currentQuestion.correctAnswer;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-2xl p-8 border border-teal-100">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✍️</span>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Diagnostic Test
              </h2>
            </div>
            <span className="bg-white px-4 py-2 rounded-xl text-gray-700 font-semibold shadow-md">
              <span className="text-blue-600">{currentQuestionIndex + 1}</span> / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            💡 {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete - Keep it up!
          </p>
        </div>

        <div className="mb-10 bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
          <div className="flex items-start gap-3 mb-6">
            <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
              {currentQuestionIndex + 1}
            </span>
            <h3 className="text-xl font-semibold text-gray-800 leading-relaxed pt-1">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion.id] === index;
              const isCorrectAnswer = index === currentQuestion.correctAnswer;
              const showAsCorrect = showFeedback && isCorrectAnswer;
              const showAsIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-5 rounded-xl border-3 transition-all duration-200 ${
                    showAsCorrect
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                      : showAsIncorrect
                      ? 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg'
                      : isSelected
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-teal-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                  } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full border-3 mr-4 flex items-center justify-center transition-all ${
                      showAsCorrect
                        ? 'border-green-500 bg-green-500 shadow-lg'
                        : showAsIncorrect
                        ? 'border-red-500 bg-red-500 shadow-lg'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500 shadow-lg'
                        : 'border-gray-300'
                    }`}>
                      {showAsCorrect && <span className="text-white text-base font-bold">✓</span>}
                      {showAsIncorrect && <span className="text-white text-base font-bold">✗</span>}
                      {!showFeedback && isSelected && <span className="text-white text-base font-bold">✓</span>}
                    </span>
                    <span className={`font-medium ${
                      showAsCorrect ? 'text-green-700' : showAsIncorrect ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`mt-6 p-6 rounded-xl border-2 ${
              isCorrect
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{isCorrect ? '🎉' : '📚'}</span>
                <div>
                  <h4 className={`text-xl font-bold mb-2 ${
                    isCorrect ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Not Quite'}
                  </h4>
                  {!isCorrect && (
                    <p className="text-gray-700 mb-3 font-semibold">
                      The correct answer is: <span className="text-green-600">{currentQuestion.options[currentQuestion.correctAnswer]}</span>
                    </p>
                  )}
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-semibold">Explanation:</span> {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t-2 border-teal-100">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-gray-700"
          >
            ← Previous
          </button>

          <div className="flex gap-3">
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!showFeedback}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showFeedback ? 'Continue →' : 'Select an answer'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || !showFeedback}
                className="group px-10 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>Submit Test</span>
                <span className="text-xl group-hover:scale-110 transition-transform">🚀</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}