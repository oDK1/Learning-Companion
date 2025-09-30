'use client';

import { useState, useEffect } from 'react';
import { useStore, Flashcard } from '@/lib/store';

export default function Flashcards() {
  const [loading, setLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentDocument = useStore((state) => state.currentDocument);
  const testResult = useStore((state) => state.testResult);
  const questions = useStore((state) => state.questions);
  const flashcards = useStore((state) => state.flashcards);
  const setFlashcards = useStore((state) => state.setFlashcards);
  const markFlashcardMastered = useStore((state) => state.markFlashcardMastered);

  useEffect(() => {
    if (testResult && flashcards.length === 0) {
      generateFlashcards();
    }
  }, [testResult]);

  const generateFlashcards = async () => {
    if (!testResult || !currentDocument) return;

    setLoading(true);
    try {
      const incorrectQuestions = questions.filter((q) =>
        testResult.incorrectQuestions.includes(q.id)
      );
      const incorrectTopics = [...new Set(incorrectQuestions.map((q) => q.topic))];

      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incorrectTopics,
          summary: currentDocument.summary,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate flashcards');

      const { flashcards } = await response.json();
      setFlashcards(flashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleNext = () => {
    if (currentCardIndex < activeFlashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setFlipped(false);
    }
  };

  const handleMarkMastered = () => {
    const currentCard = activeFlashcards[currentCardIndex];
    markFlashcardMastered(currentCard.id);

    if (currentCardIndex >= activeFlashcards.length - 1) {
      setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
    }
    setFlipped(false);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-white rounded-2xl p-12 shadow-2xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🎯</div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-2">Creating your flashcards...</p>
          <p className="text-gray-600">Personalizing your review materials ✨</p>
        </div>
      </div>
    );
  }

  const activeFlashcards = flashcards.filter((card) => !card.mastered);

  if (activeFlashcards.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow-2xl p-12 text-center border-2 border-green-200">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h2 className="text-5xl font-black bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            All Done!
          </h2>
          <p className="text-2xl text-gray-700 mb-8 font-semibold">
            You've mastered all the flashcards! 🎉
          </p>
          <div className="bg-white rounded-xl p-6 max-w-md mx-auto shadow-lg">
            <p className="text-gray-600 text-lg">
              Amazing work! You can upload a new document or retake the test to keep learning.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = activeFlashcards[currentCardIndex];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-4xl">🎯</span>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Review Flashcards
          </h2>
        </div>
        <div className="inline-block bg-white px-6 py-3 rounded-xl shadow-lg border-2 border-green-200">
          <p className="text-gray-700 font-bold text-lg">
            <span className="text-green-600">{activeFlashcards.length}</span> card{activeFlashcards.length !== 1 ? 's' : ''} remaining 💪
          </p>
        </div>
      </div>

      <div className="mb-10">
        <div className="relative w-full h-[28rem] perspective-1000">
          <div
            className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${
              flipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front of card */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-10 backface-hidden flex flex-col justify-center items-center border-4 border-purple-200 hover:shadow-[0_20px_60px_rgba(147,51,234,0.3)] transition-shadow"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                ❓ Question
              </div>
              <p className="text-3xl text-center text-gray-800 font-bold leading-relaxed mb-8">
                {currentCard.question}
              </p>
              <div className="mt-auto flex items-center gap-2 text-sm text-gray-500 animate-pulse">
                <span>👆</span>
                <span>Click to reveal answer</span>
              </div>
            </div>

            {/* Back of card */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl shadow-2xl p-10 backface-hidden flex flex-col justify-center items-center border-4 border-teal-300 hover:shadow-[0_20px_60px_rgba(20,184,166,0.3)] transition-shadow"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                💡 Answer
              </div>
              <p className="text-2xl text-center text-gray-800 font-semibold leading-relaxed mb-8">
                {currentCard.answer}
              </p>
              <div className="mt-auto flex items-center gap-2 text-sm text-gray-500 animate-pulse">
                <span>👆</span>
                <span>Click to see question</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100">
        <button
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-400 hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-gray-700"
        >
          ← Previous
        </button>

        <span className="bg-gradient-to-r from-purple-100 to-teal-100 px-6 py-3 rounded-xl text-gray-800 font-bold text-lg border-2 border-purple-200">
          {currentCardIndex + 1} / {activeFlashcards.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentCardIndex === activeFlashcards.length - 1}
          className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-teal-400 hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-gray-700"
        >
          Next →
        </button>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={handleMarkMastered}
          className="group px-10 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3 mx-auto"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform">✓</span>
          <span>I've Mastered This!</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border-2 border-purple-200 shadow-md">
        <div className="flex items-center gap-2 text-gray-700">
          <span className="text-xl">📚</span>
          <span className="font-semibold">Topic:</span>
          <span className="font-medium text-purple-700">{currentCard.topic}</span>
        </div>
      </div>
    </div>
  );
}