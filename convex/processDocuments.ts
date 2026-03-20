import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

type DocumentType =
  | "Annual Report"
  | "Interim Report"
  | "Announcement"
  | "Press Release"
  | "Other";

export const processAllPending = action({
  args: {},
  handler: async (ctx) => {
    const pendingDocs = await ctx.runQuery(api.documents.getPendingDocuments, {
      limit: 5,
    });
    console.log(`Processing ${pendingDocs.length} pending documents.`);

    let processed = 0;
    for (const doc of pendingDocs) {
      try {
        await ctx.runAction(api.processDocuments.processPendingDocument, {
          documentId: doc._id,
        });
        processed++;
      } catch (e) {
        console.error(`Failed to process document ${doc._id}`, e);
      }
    }

    return { success: true, processed };
  },
});

export const processPendingDocument = action({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    message: string;
    title: string;
    type: DocumentType;
    markdownLength: number;
  }> => {
    const document = await ctx.runQuery(api.documents.getDocument, {
      documentId: args.documentId,
    });

    if (!document) {
      throw new Error(`Document not found: ${args.documentId}`);
    }

    if (document.status !== "pending") {
      throw new Error(
        `Document ${args.documentId} is already ${document.status}`,
      );
    }

    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    if (!MISTRAL_API_KEY) {
      throw new Error("Missing MISTRAL_API_KEY environment variable.");
    }

    // Mark as processing
    await ctx.runMutation(api.documents.updateStatus, {
      documentId: args.documentId,
      status: "processing",
    });

    try {
      // 1. Fire up Mistral OCR
      const ocrResponse = await fetch("https://api.mistral.ai/v1/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-ocr-latest",
          document: {
            type: "document_url",
            document_url: document.pdfUrl,
          },
        }),
      });

      if (!ocrResponse.ok) {
        throw new Error(
          `Mistral OCR failed: ${ocrResponse.status} ${ocrResponse.statusText} ${await ocrResponse.text()}`,
        );
      }

      const ocrData = await ocrResponse.json();
      const pages = ocrData.pages || [];
      const markdownContent = pages
        .map((p: { markdown: string }) => p.markdown)
        .join("\n\n");

      // Extract the first page text for metadata processing
      const firstPageContent = pages[0]?.markdown || "";

      // 2. Extact Metadata
      let newTitle = document.title;
      let newType: DocumentType = "Other";
      let newPublishedDate = document.publishedDate;

      if (firstPageContent) {
        const prompt = `
          Extract the title, document type, and published date from this document's cover page text.
          Determine the document type from one of these strictly: "Annual Report", "Interim Report", "Announcement", "Press Release", "Other".
          Return the date in ISO format (YYYY-MM-DD) if possible.

          Document Cover Page Text:
          """
          ${firstPageContent}
          """
        `;

        const llmResponse = await fetch(
          "https://api.mistral.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
              model: "mistral-small-latest",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a specialized financial data metadata extractor. You only return strictly formatted JSON objects.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              response_format: { type: "json_object" },
            }),
          },
        );

        if (llmResponse.ok) {
          const llmData = await llmResponse.json();
          try {
            const rawJson = llmData.choices[0].message.content;
            const parsed = JSON.parse(rawJson);
            if (parsed.title) newTitle = parsed.title;
            if (
              [
                "Annual Report",
                "Interim Report",
                "Announcement",
                "Press Release",
                "Other",
              ].includes(parsed.document_type || parsed.type)
            ) {
              newType = parsed.document_type || parsed.type;
            }
            if (parsed.date || parsed.publishedDate) {
              newPublishedDate = parsed.date || parsed.publishedDate;
            }
          } catch (e) {
            console.error("Failed to parse Mistral LLM metadata", e);
          }
        } else {
          console.warn(
            "Mistral LLM extraction failed. Defaulting to original metadata.",
            await llmResponse.text(),
          );
        }
      }

      await ctx.runMutation(api.documents.updateStatus, {
        documentId: args.documentId,
        status: "completed",
        markdownContent,
        title: newTitle,
        type: newType,
        publishedDate: newPublishedDate,
      });

      return {
        success: true,
        message: "Document processed successfully.",
        title: newTitle,
        type: newType,
        markdownLength: markdownContent.length,
      };
    } catch (err) {
      console.error(err);
      // Mark as failed
      await ctx.runMutation(api.documents.updateStatus, {
        documentId: args.documentId,
        status: "failed",
      });
      throw err;
    }
  },
});
