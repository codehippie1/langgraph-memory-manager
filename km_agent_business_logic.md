# 🧠 Kernel Memory Agent – Business Logic

This LangChain.js + Node.js application is designed to act as a smart interface between a user and a locally running Kernel Memory (KM) service at `http://127.0.0.1:9001/`.

The app uses LangChain agents to:
1. Detect user **intent**.
2. Route the request to **retrieve** or **store** memory accordingly.
3. Interact with the Kernel Memory API via HTTP.

---

## 💡 User Intent Detection

The application identifies whether the user's intent is to:

- **Retrieve** stored information from memory.
- **Store** a new note, URL, or message to memory.

---

## 🔍 Intent: RETRIEVE

If the user's intent is to retrieve something:
1. Ensure the query is clear and self-contained (e.g., "What did I save about LLMs in March?" or "Show me notes from NYC").
2. If the query is ambiguous, **ask for clarification**.
3. Once clear, call: http://127.0.0.1:9001/ask
4. Display the response to the user.

---

## 📝 Intent: STORE

If the user wants to save a memory:
1. Ask the user for (if not already provided):
   - **What** they’re storing (text content, URL, idea, etc.)
   - **Location** (e.g., “NYC subway”, “at home”)
   - **Category** (e.g., “personal note”, "URL")
   - **Secrecy** (e.g., “startup idea”, “access code”)

2. Once all required details are collected:
   - Format the content (e.g., prepend metadata)
   - Call: http://127.0.0.1:9001/upload
3. Confirm back to the user that the memory was stored.

---

## ✅ Key Behaviors

- Use LangChain tools or agents to classify intent.
- Retry or clarify if incomplete information is provided.
- Format metadata clearly (e.g., date, category, location, Secrecy).
- You do **not** need to handle search ranking — Kernel Memory handles semantic ranking internally.

---

## 📦 Notes for Cursor AI

- Prioritize clarity and user experience in conversations.
- Output raw KM API calls and example responses if requested.
- Keep the logic modular: intent detection → metadata gathering → API call.