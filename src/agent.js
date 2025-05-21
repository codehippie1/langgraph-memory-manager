import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, END } from "@langchain/langgraph";
import axios from "axios";
import dotenv from "dotenv";
import { KernelMemoryClient } from "./kernelMemoryClient.js";

dotenv.config();

// Initialize KM client with our minimal API endpoint
const km = new KernelMemoryClient("http://localhost:5000");

// Initialize the OpenAI LLM
const llm = new ChatOpenAI({
  openAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  modelName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  temperature: 0,
  configuration: {
    baseURL: process.env.AZURE_OPENAI_BASE_URL,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION }
  }
});

/*const aiMsg = await llm.invoke([
  [
    "system",
    "You are a helpful assistant that translates English to French. Translate the user sentence.",
  ],
  ["human", "I love programming."],
]);
console.log("ANSWER ---------------------->")
console.log(aiMsg)
*/

// Define the graph with correct channel types
const workflow = new StateGraph({
  channels: {
    messages: { type: "list" },
    intent: { type: "string" },
    metadata: { type: "object" },
    response: { type: "string" }
  }
});

function extractJsonFromCodeBlock(text) {
  return text
    .replace(/```json\\s*/i, '')
    .replace(/```/g, '')
    .trim();
}

// Intent detection node
async function detectIntent(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  const prompt = `Determine if the user wants to RETRIEVE information or STORE new information.\n  User message: ${lastMessage}\n  Respond with either "RETRIEVE" or "STORE".`;

  const response = await llm.invoke(prompt);
  return { ...state, intent: response.content.trim() };
}

// Metadata gathering node
async function gatherMetadata(state) {
  if (state.intent === "RETRIEVE") {
    return { ...state, response: "Proceeding with retrieval..." };
  }

  const lastMessage = state.messages[state.messages.length - 1];
  // Handle both string messages and message objects
  const messageContent = typeof lastMessage === 'string' ? lastMessage : lastMessage.message;
  
  console.log("=== Metadata Extraction ===");
  console.log("Original message:", lastMessage);
  console.log("Extracted content:", messageContent);
  
  const prompt = `Extract metadata from the following message and format it as JSON with these specific fields:
  - type: Either "note" or "link" (defaults to "note" if not specified)
  - content: The main content of the note or the URL if type is "link"
  - location: A specific place (e.g., "train", "office", "cafe", "home", "park", "airport")
  - category: One of ["personal", "work", "idea", "task", "meeting", "research", "project", "learning"]
  - secrecy: One of ["public", "private", "confidential", "restricted"] (defaults to "public" if not specified)
  - date: Today's date in MM-DD-YYYY format

  User message: ${messageContent}
  
  Example format for note:
  {
    "type": "note",
    "content": "Meeting notes about project timeline",
    "location": "office",
    "category": "meeting",
    "secrecy": "private",
    "date": "03-15-2024"
  }

  Example format for link:
  {
    "type": "link",
    "content": "https://example.com/article",
    "location": "home",
    "category": "research",
    "secrecy": "public",
    "date": "03-15-2024"
  }

  Respond ONLY with valid JSON. Do NOT include markdown or code block markers.`;

  const response = await llm.invoke(prompt);
  console.log("LLM Response:", response.content);
  
  try {
    const cleaned = extractJsonFromCodeBlock(response.content);
    console.log("Cleaned LLM Response:", cleaned);
    const metadata = JSON.parse(cleaned);
    console.log("Parsed metadata:", metadata);
    
    // Set default values
    metadata.type = metadata.type || 'note';
    metadata.secrecy = metadata.secrecy || 'public';
    
    // Validate metadata structure
    const requiredFields = ['content', 'location', 'category', 'date'];
    const validTypes = ['note', 'link'];
    const validCategories = ['personal', 'work', 'idea', 'task', 'meeting', 'research', 'project', 'learning'];
    const validSecrecyLevels = ['public', 'private', 'confidential', 'restricted'];
    
    // Check if all required fields are present
    const missingFields = requiredFields.filter(field => !metadata[field]);
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      return { 
        ...state, 
        response: `Missing required fields: ${missingFields.join(', ')}. Please provide all required information.` 
      };
    }

    // Validate type
    if (!validTypes.includes(metadata.type)) {
      return { 
        ...state, 
        response: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      };
    }

    // Validate content based on type
    if (metadata.type === 'link') {
      try {
        new URL(metadata.content);
      } catch (error) {
        return { 
          ...state, 
          response: 'Invalid URL format for link type' 
        };
      }
    }

    // Validate category
    if (!validCategories.includes(metadata.category)) {
      return { 
        ...state, 
        response: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      };
    }

    // Validate secrecy level
    if (!validSecrecyLevels.includes(metadata.secrecy)) {
      return { 
        ...state, 
        response: `Invalid secrecy level. Must be one of: ${validSecrecyLevels.join(', ')}` 
      };
    }

    // Validate date format (MM-DD-YYYY)
    const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/;
    if (!dateRegex.test(metadata.date)) {
      return { 
        ...state, 
        response: 'Invalid date format. Must be MM-DD-YYYY' 
      };
    }

    console.log("Final metadata:", metadata);
    return { ...state, metadata };
  } catch (error) {
    console.log("Error parsing metadata:", error);
    return { 
      ...state, 
      response: "Could not parse metadata. Please provide information in the correct format." 
    };
  }
}

// API interaction node
async function interactWithKM(state) {
  try {
    if (state.intent === "RETRIEVE") {
      const response = await km.ask(state.messages[state.messages.length - 1]);
      return { ...state, response: response };
    } else if (state.intent === "STORE") {
      // Create documentId from tags
      const documentId = [
        state.metadata.type,
        state.metadata.location,
        state.metadata.category,
        state.metadata.secrecy,
        state.metadata.date
      ].join('_')
        .toLowerCase()
        .replace(/\s+/g, '-'); // Replace any spaces with dashes

      // Prepare tags
      const tags = {
        type: state.metadata.type,
        location: state.metadata.location,
        category: state.metadata.category,
        secrecy: state.metadata.secrecy,
        date: state.metadata.date
      };

      // Add URL as a tag if it's a link
      if (state.metadata.type === 'link') {
        tags.url = state.metadata.content;
      }

      // Prepare the upload payload
      const uploadPayload = {
        documentId: documentId,
        tags: tags,
        content: state.metadata.type === 'link' ? 
          `URL: ${state.metadata.content}` : 
          state.metadata.content
      };

      console.log("=== Calling importTextAsync ===");
      console.log("Content:", uploadPayload.content);
      console.log("DocumentId:", documentId);
      console.log("Tags:", JSON.stringify(tags, null, 2));
      //console.log("Steps:", ["split", "embed"]);
      console.log("============================");
      
      if (!uploadPayload.content) {
        return { 
          ...state, 
          response: "Error: Content cannot be empty" 
        };
      }

      await km.importTextAsync(uploadPayload.content, {
        documentId: documentId,
        index: "default",
        tags: tags,
        //steps: ["split", "embed"]
      });

      return { 
        ...state, 
        response: `Memory stored successfully! Document ID: ${documentId}` 
      };
    }
  } catch (error) {
    return { 
      ...state, 
      response: `Error: ${error.message}` 
    };
  }
}

// Add nodes
workflow.addNode("detectIntent", detectIntent);
workflow.addNode("gatherMetadata", gatherMetadata);
workflow.addNode("interactWithKM", interactWithKM);

// Add edges
workflow.addEdge("detectIntent", "gatherMetadata");
workflow.addEdge("gatherMetadata", "interactWithKM");
workflow.addEdge("interactWithKM", END);

// Set the entry point
workflow.setEntryPoint("detectIntent");

// Compile the graph
const app = workflow.compile();

export default app; 