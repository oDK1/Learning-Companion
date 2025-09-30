# Personalized Learning App

A web-based learning application that helps users master content from uploaded documents through AI-powered summarization, diagnostic testing, and targeted flashcard review.

## Features

- **Document Upload**: Support for PDF, TXT, and DOCX files
- **AI Summarization**: Automatic extraction of 5-10 key takeaways using Claude AI
- **Diagnostic Testing**: 10-15 multiple choice questions to assess understanding
- **Personalized Flashcards**: Auto-generated flashcards for topics you missed
- **Progress Tracking**: Local storage of your learning progress
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **AI**: Anthropic Claude API
- **Document Parsing**: pdf-parse, mammoth

## Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Getting Started

1. **Clone and navigate to the project**
   ```bash
   cd learning-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Workflow

1. **Upload Document** → Upload a PDF, TXT, or DOCX file
2. **View Summary** → Review the AI-generated key takeaways
3. **Take Diagnostic Test** → Answer 10-15 multiple choice questions
4. **Review Flashcards** → Study flashcards for topics you missed
5. **Retake or Upload New** → Test again or start with a new document

## Project Structure

```
learning-app/
├── app/
│   ├── api/
│   │   ├── summarize/         # Claude API summarization endpoint
│   │   ├── generate-questions/ # Question generation endpoint
│   │   └── generate-flashcards/ # Flashcard generation endpoint
│   └── page.tsx                # Main app page with workflow
├── components/
│   ├── DocumentUpload.tsx      # File upload component
│   ├── Summary.tsx             # Summary display
│   ├── Quiz.tsx                # Test interface
│   └── Flashcards.tsx          # Flashcard review system
├── lib/
│   ├── store.ts                # Zustand state management
│   └── document-parser.ts      # Document parsing utilities
└── .env.local                  # Environment variables
```

## Features in Detail

### Document Processing
- Extracts text from PDF, TXT, and DOCX files
- Sends content to Claude API for analysis
- Generates 5-10 clear, structured key takeaways

### Diagnostic Testing
- Creates 10-15 multiple choice questions based on content
- Tests understanding, not just memorization
- Tracks incorrect answers to identify weak areas
- Shows score and detailed results

### Flashcard System
- Automatically generates 2-3 flashcards per missed topic
- Interactive flip animation
- Mark cards as "mastered" to remove from rotation
- Topic-based organization

### Data Persistence
- All documents, tests, and flashcards saved in browser
- Progress persists across sessions
- Reset functionality for retaking tests

## Configuration

### Changing AI Model
Edit the API route files to use different Claude models:
```typescript
// In app/api/*/route.ts
model: 'claude-3-5-sonnet-20241022' // Change to desired model
```

### Adjusting Question Count
Modify the prompts in `app/api/generate-questions/route.ts` to generate more or fewer questions.

## Troubleshooting

**"Failed to generate summary"**
- Check that your ANTHROPIC_API_KEY is set correctly
- Ensure you have API credits available
- Verify the document contains readable text

**"Document appears to be empty"**
- Some PDFs may be image-based and require OCR
- Try converting to TXT first
- Ensure the file is not corrupted

**Flashcards not showing**
- You must answer at least one question incorrectly
- Check browser console for errors
- Clear local storage and try again

## Building for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT