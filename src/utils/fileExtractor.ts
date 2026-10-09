import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker using unpkg or cdnjs or dynamic fallback
if (typeof window !== 'undefined') {
  // Using official cdn worker matching pdfjs-dist
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface ExtractedFileResult {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  pageCount?: number;
  wordCount: number;
}

export async function extractTextFromFile(file: File): Promise<ExtractedFileResult> {
  const fileName = file.name;
  const fileSize = file.size;
  const fileType = file.type || '';
  const lowerName = fileName.toLowerCase();

  // Validate size (max 25MB)
  if (fileSize > 25 * 1024 * 1024) {
    throw new Error('File size exceeds 25MB limit. Please upload a smaller document.');
  }

  // Handle TXT, Markdown, CSV, etc.
  if (
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.rtf') ||
    lowerName.endsWith('.csv') ||
    fileType.startsWith('text/')
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result as string) || '';
        if (!text.trim()) {
          reject(new Error('The uploaded text file is empty. Please check the file contents.'));
          return;
        }
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        resolve({
          text,
          fileName,
          fileSize,
          fileType: 'Text Document',
          wordCount,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  }

  // Handle PDF
  if (lowerName.endsWith('.pdf') || fileType === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      if (numPages === 0) {
        throw new Error('PDF has no pages.');
      }

      let fullText = '';
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        fullText += `\n--- Page ${pageNum} ---\n` + pageText;
      }

      const cleanText = fullText.trim();
      if (!cleanText || cleanText.length < 20) {
        throw new Error(
          'Could not extract text from this PDF. It might be a scanned image without selectable text. Please copy and paste the text directly.'
        );
      }

      const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
      return {
        text: cleanText,
        fileName,
        fileSize,
        fileType: 'PDF Document',
        pageCount: numPages,
        wordCount,
      };
    } catch (err: any) {
      console.error('PDF extraction error:', err);
      if (err.message && err.message.includes('password')) {
        throw new Error('This PDF is password protected. Please provide an unlocked document.');
      }
      throw new Error(err.message || 'Failed to extract text from PDF file.');
    }
  }

  throw new Error('Unsupported file format. Please upload a .pdf, .txt, or .md file.');
}
