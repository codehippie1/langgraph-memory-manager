import express from "express";
import app from "./agent.js";

const server = express();
server.use(express.json());

server.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const initialState = {
      messages: [message],
      intent: null,
      metadata: {
        content: null,
        location: null,
        category: null,
        secrecy: null,
      },
      response: null,
    };

    const result = await app.invoke(initialState);
    res.json(result);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 