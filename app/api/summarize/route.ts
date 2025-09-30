import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    // Limit content to first 15000 characters to avoid rate limits
    const limitedContent = content.slice(0, 15000);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Analyze the following document and extract 5-10 key takeaways. Present them as a JSON array of strings, where each string is a clear, concise main point from the document. Format your response as valid JSON only, with no additional text.

Document:
${limitedContent}

Return format: ["key point 1", "key point 2", ...]`,
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

    const summary = JSON.parse(jsonText);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}