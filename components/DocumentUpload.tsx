'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addDocument = useStore((state) => state.addDocument);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Upload and parse document on server
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      const { content, fileName } = await uploadResponse.json();

      // Generate summary
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary');
      }

      const { summary } = await summaryResponse.json();

      // Create document
      const doc = {
        id: Date.now().toString(),
        name: fileName,
        content,
        summary,
        uploadedAt: Date.now(),
      };

      addDocument(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-3">
          <span className="text-black">🚀 Accelerate Your Learning Through <a href="https://www.justinmath.com/files/the-math-academy-way.pdf" target="_blank" rel="noopener noreferrer" className="text-purple-600 italic underline hover:text-purple-700">Learning Science</a></span>
        </h2>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative border-3 border-dashed border-purple-300 rounded-2xl p-16 text-center bg-white hover:border-purple-500 hover:shadow-2xl transition-all duration-300">
          <input
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
          >
            <div className="text-gray-600">
              {uploading ? (
                <>
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">⚡</div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mb-2">Processing your document...</p>
                  <p className="text-sm text-gray-500">AI is analyzing the content ✨</p>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-6 animate-bounce">📄</div>
                  <p className="text-2xl font-bold text-gray-800 mb-3">Upload Your Study Material</p>
                  <p className="text-base text-gray-600 mb-6">PDF, TXT, or DOCX • Up to 10MB</p>
                  <div className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    ✨ Choose File
                  </div>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Oops! Something went wrong</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}