'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import DocumentUpload from '@/components/DocumentUpload';
import Summary from '@/components/Summary';
import Quiz from '@/components/Quiz';
import Flashcards from '@/components/Flashcards';

type Stage = 'upload' | 'summary' | 'quiz' | 'flashcards';

export default function Home() {
  const [stage, setStage] = useState<Stage>('upload');
  const currentDocument = useStore((state) => state.currentDocument);
  const testResult = useStore((state) => state.testResult);
  const resetTest = useStore((state) => state.resetTest);

  useEffect(() => {
    if (currentDocument && stage === 'upload') {
      setStage('summary');
    }
  }, [currentDocument]);

  const handleStartTest = () => {
    setStage('quiz');
  };

  const handleTestComplete = () => {
    setStage('flashcards');
  };

  const handleNewDocument = () => {
    resetTest();
    setStage('upload');
  };

  const handleRetakeTest = () => {
    resetTest();
    setStage('quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
      <header className="">
        <div className="max-w-7xl mx-auto pl-4 pr-4 py-6 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
          <div className="flex justify-between items-center">
            <button
              onClick={handleNewDocument}
              className="flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer -ml-[50px]"
            >
              <div className="text-3xl">📚</div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-[24px]">
                Learning Companion
              </h1>
            </button>
            {currentDocument && stage !== 'quiz' && testResult && (
              <button
                onClick={handleRetakeTest}
                className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 hover:shadow-md transition-all"
              >
                🔄 Retake Test
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        {currentDocument && (
          <div className="mb-10">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <div className={`flex items-center transition-all ${stage === 'upload' || stage === 'summary' ? 'text-purple-600 scale-110' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all ${
                  stage === 'summary' ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white scale-110' : 'bg-gray-200 text-gray-500'
                }`}>
                  📖
                </div>
                <span className="ml-2 font-semibold hidden sm:inline">Summary</span>
              </div>
              <div className={`w-12 sm:w-16 h-1 rounded-full transition-all ${stage !== 'summary' ? 'bg-gradient-to-r from-purple-400 to-blue-400' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center transition-all ${stage === 'quiz' ? 'text-purple-600 scale-110' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all ${
                  stage === 'quiz' ? 'bg-gradient-to-br from-blue-500 to-teal-500 text-white scale-110' : 'bg-gray-200 text-gray-500'
                }`}>
                  ✍️
                </div>
                <span className="ml-2 font-semibold hidden sm:inline">Test</span>
              </div>
              <div className={`w-12 sm:w-16 h-1 rounded-full transition-all ${stage === 'flashcards' ? 'bg-gradient-to-r from-blue-400 to-teal-400' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center transition-all ${stage === 'flashcards' ? 'text-purple-600 scale-110' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all ${
                  stage === 'flashcards' ? 'bg-gradient-to-br from-teal-500 to-green-500 text-white scale-110' : 'bg-gray-200 text-gray-500'
                }`}>
                  💡
                </div>
                <span className="ml-2 font-semibold hidden sm:inline">Flashcard</span>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        {stage === 'upload' && <DocumentUpload />}
        {stage === 'summary' && <Summary onStartTest={handleStartTest} />}
        {stage === 'quiz' && <Quiz onComplete={handleTestComplete} />}
        {stage === 'flashcards' && <Flashcards />}
      </main>
    </div>
  );
}