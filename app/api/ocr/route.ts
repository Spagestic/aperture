import { NextResponse } from "next/server";

export const maxDuration = 60;

type DocumentInput =
  | {
      type: "document_url";
      documentUrl?: string;
      document_url?: string;
    }
  | {
      type: "image_url";
      imageUrl?: string;
      image_url?: string;
    };

type OcrRequestBody = {
  model?: string;
  document?: DocumentInput;
  tableFormat?: "html" | "markdown" | null;
  table_format?: "html" | "markdown" | null;
  extractHeader?: boolean;
  extract_header?: boolean;
  extractFooter?: boolean;
  extract_footer?: boolean;
  includeImageBase64?: boolean;
  include_image_base64?: boolean;
};

function normalizeDocument(document?: DocumentInput) {
  if (!document) return null;

  if (document.type === "document_url") {
    const documentUrl = document.documentUrl ?? document.document_url;
    if (!documentUrl) return null;

    return {
      type: "document_url" as const,
      document_url: documentUrl,
    };
  }

  if (document.type === "image_url") {
    const imageUrl = document.imageUrl ?? document.image_url;
    if (!imageUrl) return null;

    return {
      type: "image_url" as const,
      image_url: imageUrl,
    };
  }

  return null;
}

async function readJson(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing MISTRAL_API_KEY" },
      { status: 500 },
    );
  }

  let body: OcrRequestBody;

  try {
    body = (await req.json()) as OcrRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const document = normalizeDocument(body.document);

  if (!document) {
    return NextResponse.json(
      {
        error:
          'Provide document.type and a valid documentUrl/imageUrl. Example: { "document": { "type": "document_url", "documentUrl": "https://..." } }',
      },
      { status: 400 },
    );
  }

  const payload = {
    model: body.model ?? "mistral-ocr-latest",
    document,
    table_format: body.table_format ?? body.tableFormat ?? null,
    extract_header: body.extract_header ?? body.extractHeader ?? false,
    extract_footer: body.extract_footer ?? body.extractFooter ?? false,
    include_image_base64:
      body.include_image_base64 ?? body.includeImageBase64 ?? false,
  };

  try {
    const response = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await readJson(response);

    if (!response.ok) {
      return NextResponse.json(
        data ?? { error: "Mistral OCR request failed" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Mistral OCR route error:", error);

    return NextResponse.json(
      { error: "Failed to reach Mistral OCR API" },
      { status: 500 },
    );
  }
}
