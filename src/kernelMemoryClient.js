import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

export class KernelMemoryClient {
  constructor(baseUrl = "http://localhost:5000") {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // remove trailing slash if any
  }

  async ask(question, options = {}) {
    const { index = "default", filters = null } = options;
    
    const requestBody = {
      input: question,
      //index: index,
      //filters: filters
    };

    console.log("=== KernelMemoryClient ask request ===");
    console.log("URL:", `${this.baseUrl}/ask`);
    console.log("Method: POST");
    console.log("Headers:", { "Content-Type": "application/json" });
    console.log("Body:", JSON.stringify(requestBody, null, 2));
    console.log("=====================================");
    
    const res = await fetch(`${this.baseUrl}/ask`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to query memory: ${error}`);
    }

    const data = await res.json();
    console.log("KernelMemoryClient ask data:", data);
    return data.result || "No relevant memory found.";
  }

  async importTextAsync(text, options = {}) {
    const {
      documentId = null,
      index = "default",
      tags = null,
      steps = null
    } = options;

    const res = await fetch(`${this.baseUrl}/uploadText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        documentId: documentId,
        index: index,
        tags: tags,
        steps: steps
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Text upload failed: ${error}`);
    }

    return await res.json();
  }

  async importFileAsync(filepath, options = {}) {
    const {
      documentId = null,
      index = "default",
      tags = null,
      steps = null
    } = options;

    const form = new FormData();
    form.append("file", fs.createReadStream(filepath));
    
    if (documentId) form.append("documentId", documentId);
    if (index) form.append("index", index);
    if (steps) form.append("steps", steps.join(","));
    if (tags) form.append("tags", JSON.stringify(tags));

    const res = await fetch(`${this.baseUrl}/uploadFile`, {
      method: "POST",
      headers: form.getHeaders(),
      body: form,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`File upload failed: ${error}`);
    }

    return await res.json();
  }

  async deleteDocumentAsync(documentId, index = "default") {
    const res = await fetch(`${this.baseUrl}/delete?documentId=${encodeURIComponent(documentId)}&index=${encodeURIComponent(index)}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Document deletion failed: ${error}`);
    }

    return await res.json();
  }
}