import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, END } from "@langchain/langgraph";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();


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
  const prompt = `Extract metadata from the following message:\n  ${lastMessage}\n  Format: JSON with fields: content, location, category, secrecy`;

  const response = await llm.invoke(prompt);
  try {
    const metadata = JSON.parse(response.content);
    return { ...state, metadata };
  } catch (error) {
    return { ...state, response: "Could not parse metadata. Please provide clearer information." };
  }
}

// API interaction node
async function interactWithKM(state) {
  try {
    if (state.intent === "RETRIEVE") {
      const response = await axios.post(`${process.env.KM_API_URL}/ask`, {
        question: state.messages[state.messages.length - 1],
      });
      return { ...state, response: response.data };
    } else {
      const response = await axios.post(`${process.env.KM_API_URL}/upload`, {
        content: state.metadata.content,
        metadata: {
          location: state.metadata.location,
          category: state.metadata.category,
          secrecy: state.metadata.secrecy,
        },
      });
      return { ...state, response: "Memory stored successfully!" };
    }
  } catch (error) {
    return { ...state, response: `Error: ${error.message}` };
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