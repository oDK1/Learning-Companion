import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { summary, content } = await request.json();

    if (!summary || !Array.isArray(summary)) {
      return NextResponse.json(
        { error: 'Summary is required and must be an array' },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `Based on the following key takeaways from a document, generate exactly 10 multiple choice questions that test understanding (not just memorization). Each question should have 4 options with only one correct answer.

Key Takeaways:
${summary.map((point, i) => `${i + 1}. ${point}`).join('\n')}

Return the questions as a JSON array with this exact structure:
[
  {
    "id": "q1",
    "question": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": 0,
    "topic": "which key takeaway this relates to",
    "explanation": "why the correct answer is correct"
  }
]

Generate exactly 10 questions. Return only valid JSON with no additional text.`,
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

    let questions = JSON.parse(jsonText);

    // Ensure we return exactly 10 questions
    if (Array.isArray(questions) && questions.length > 10) {
      questions = questions.slice(0, 10);
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}