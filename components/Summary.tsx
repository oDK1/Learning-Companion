'use client';

import { useStore } from '@/lib/store';

interface SummaryProps {
  onStartTest: () => void;
}

export default function Summary({ onStartTest }: SummaryProps) {
  const currentDocument = useStore((state) => state.currentDocument);

  if (!currentDocument) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl p-8 border border-purple-100">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">📖</span>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Document Summary
            </h2>
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-white/70 rounded-lg px-4 py-2 inline-block">
            <span className="text-sm">📄</span>
            <p className="text-sm font-medium">{currentDocument.name}</p>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="text-2xl font-bold text-gray-800">Key Takeaways</h3>
            <span className="text-xl">✨</span>
          </div>
          <ul className="space-y-4">
            {currentDocument.summary.map((point, index) => (
              <li key={index} className="flex items-start group hover:scale-[1.02] transition-transform">
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl flex items-center justify-center font-bold mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  {index + 1}
                </span>
                <p className="text-gray-700 pt-2 leading-relaxed text-lg bg-white/50 rounded-lg px-4 py-3 flex-1">{point}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 pt-6 border-t-2 border-purple-100">
          <button
            onClick={onStartTest}
            className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <span>Take Diagnostic Test</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <div className="flex items-center text-sm text-gray-500 bg-white/70 rounded-xl px-4">
            <span>💡 Test your knowledge with AI-generated questions</span>
          </div>
        </div>
      </div>
    </div>
  );
}