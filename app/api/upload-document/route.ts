import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileType = fileName.split('.').pop()?.toLowerCase();

    let content = '';

    try {
      switch (fileType) {
        case 'pdf':
          content = await parsePDF(file);
          break;
        case 'txt':
          content = await parseTXT(file);
          break;
        case 'docx':
          content = await parseDOCX(file);
          break;
        default:
          return NextResponse.json(
            { error: 'Unsupported file type. Please upload PDF, TXT, or DOCX files.' },
            { status: 400 }
          );
      }
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document appears to be empty' },
        { status: 400 }
      );
    }

    return NextResponse.json({ content, fileName });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

async function parsePDF(file: File): Promise<string> {
  const PDFParser = (await import('pdf2json')).default;

  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(errData.parserError));
    });

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        let text = '';
        pdfData.Pages.forEach((page: any) => {
          page.Texts.forEach((textItem: any) => {
            textItem.R.forEach((textRun: any) => {
              text += decodeURIComponent(textRun.T) + ' ';
            });
          });
          text += '\n';
        });
        resolve(text);
      } catch (error) {
        reject(error);
      }
    });

    file.arrayBuffer().then((arrayBuffer) => {
      const buffer = Buffer.from(arrayBuffer);
      pdfParser.parseBuffer(buffer);
    }).catch(reject);
  });
}

async function parseTXT(file: File): Promise<string> {
  return await file.text();
}

async function parseDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}