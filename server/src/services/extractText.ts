import pdfParse from "@cedrugs/pdf-parse";
import mammoth from "mammoth";

const MAX_CHARS = 8_000;

/**
 * Extracts plain text from an in-memory buffer.
 * Supports: PDF, DOCX, TXT.
 * Returns at most MAX_CHARS characters to keep downstream prompts manageable.
 */
export async function extractText(
  buffer: Buffer,
  mimetype: string,
  originalname: string,
): Promise<string> {
  let text: string;

  if (mimetype === "application/pdf") {
    let result: { text: string };
    try {
      result = await pdfParse(buffer);
    } catch (err) {
      throw new Error("Could not extract readable text from this PDF.");
    }
    text = result.text ?? "";
    if (!text.trim()) {
      throw new Error("Could not extract readable text from this PDF.");
    }
  } else if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    originalname.toLowerCase().endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    // Plain text (text/plain, text/*)
    text = buffer.toString("utf8");
  }

  // Normalise whitespace and cap length
  text = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  return text.slice(0, MAX_CHARS);
}
