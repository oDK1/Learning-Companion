import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { incorrectTopics, summary } = await request.json();

    if (!incorrectTopics || !Array.isArray(incorrectTopics)) {
      return NextResponse.json(
        { error: 'Incorrect topics are required' },
        { status: 400 }
      );
    }

    if (incorrectTopics.length === 0) {
      return NextResponse.json({ flashcards: [] });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `Create ONE simple flashcard for each topic.

Topics: ${incorrectTopics.map((topic, i) => `${i + 1}. ${topic}`).join(', ')}

Return ONLY valid JSON array:
[
  {
    "id": "fc1",
    "topic": "topic name",
    "question": "simple question",
    "answer": "simple answer in 1 sentence, 20 words max",
    "mastered": false
  }
]

CRITICAL RULES:
- Exactly 1 flashcard per topic
- Answers must be under 20 words
- Use ONLY simple words, NO apostrophes, NO quotes
- NO special characters or punctuation except periods
- Return ONLY the JSON array, nothing else`,
        },
      ],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse the JSON response - handle markdown code blocks
    let jsonText = textContent.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
    }

    // Extract array if there's extra text
    const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonText = arrayMatch[0];
    }

    // Sanitize JSON - fix common issues with unescaped characters
    // This is a best-effort attempt to fix malformed JSON
    const sanitizeJSON = (text: string): string => {
      // Find all string values and escape unescaped quotes and newlines
      // This regex is imperfect but handles common cases
      return text.replace(
        /"(answer|question|topic)"\s*:\s*"([^"]*(?:(?:\n|")[^"]*)*?)"/g,
        (match, key, value) => {
          // Escape newlines and unescaped quotes within the value
          const cleaned = value
            .replace(/\n/g, ' ')  // Replace newlines with spaces
            .replace(/\r/g, '')   // Remove carriage returns
            .replace(/\t/g, ' ')  // Replace tabs with spaces
            .replace(/\\"/g, '__ESCAPED_QUOTE__')  // Temporarily protect escaped quotes
            .replace(/"/g, '\\"')  // Escape unescaped quotes
            .replace(/__ESCAPED_QUOTE__/g, '\\"');  // Restore escaped quotes
          return `"${key}": "${cleaned}"`;
        }
      );
    };

    let flashcards;
    try {
      const sanitizedJSON = sanitizeJSON(jsonText);
      flashcards = JSON.parse(sanitizedJSON);
    } catch (parseError) {
      console.error('Failed to parse flashcard JSON. Raw text:', jsonText.substring(0, 500));
      throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}