# LangGraph Memory Manager

A Node.js application that uses LangGraph to create an intelligent interface between users and a locally running Kernel Memory service.

## Prerequisites

- Node.js (v18 or higher)
- A running Kernel Memory service at `http://127.0.0.1:9001`
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   KM_API_URL=http://127.0.0.1:9001
   ```

## Running the Application

Start the development server:
```bash
npm run dev
```

The server will start on port 3000 by default.

## API Usage

Send POST requests to `/chat` with the following JSON body:
```json
{
  "message": "Your message here"
}
```

### Example Requests

1. Storing a memory:
```json
{
  "message": "Save this note: I learned about LangGraph today. Location: Home office, Category: Learning, Secrecy: Public"
}
```

2. Retrieving information:
```json
{
  "message": "What did I learn about LangGraph?"
}
```

## Architecture

The application uses a LangGraph workflow with three main nodes:
1. Intent Detection - Determines if the user wants to store or retrieve information
2. Metadata Gathering - Extracts relevant metadata for storage
3. KM Interaction - Communicates with the Kernel Memory service

## Error Handling

The application includes error handling for:
- Invalid requests
- API communication errors
- Metadata parsing errors
- Kernel Memory service unavailability 