import fetch from 'node-fetch';

const memories = [
  {
    message: "Save this note: Need to pay water bill by Friday. Amount: $85.23. Set reminder for Thursday. Location: Home, Category: task, Secrecy: private"
  },
  {
    message: "Save this note: Startup idea: AI-powered personal memory assistant that helps people remember and organize their daily tasks, meetings, and ideas. Could use LangGraph for workflow management. Location: Coffee shop, Category: idea, Secrecy: confidential"
  },
  {
    message: "Save this note: Found an amazing blog post about Kernel Memory: https://devblogs.microsoft.com/semantic-kernel/kernel-memory-is-now-available/. Key takeaway: Great for building RAG applications. Location: Train, Category: research, Secrecy: public"
  },
  {
    message: "Save this note: Need to send email reminders to team about quarterly review meeting next Monday at 2 PM. Location: Office, Category: task, Secrecy: private"
  },
  {
    message: "Save this note: Had lunch with Sarah at that new Italian place in Midtown. Great conversation about AI ethics and future of work. Location: NYC Midtown, Category: personal, Secrecy: private"
  },
  {
    message: "Save this note: Idea for blog post: 'Building a Personal Memory System with LangGraph and Azure AI'. Should cover state management and vector search implementation. Location: Home office, Category: idea, Secrecy: public"
  },
  {
    message: "Save this note: Need to renew apartment lease by end of month. Current rent: $2,800. Should negotiate for better terms. Location: Home, Category: task, Secrecy: private"
  },
  {
    message: "Save this note: Interesting article about vector databases: https://www.pinecone.io/learn/vector-database/. Should consider using Pinecone for the memory system. Location: Train, Category: research, Secrecy: public"
  },
  {
    message: "Save this note: Meeting with potential investor tomorrow at 11 AM. Need to prepare pitch deck and demo. Location: Office, Category: meeting, Secrecy: confidential"
  },
  {
    message: "Save this note: Book recommendation from John: 'The Psychology of Memory' by Alan Baddeley. Should read it for better understanding of human memory systems. Location: Coffee shop, Category: personal, Secrecy: public"
  },
  {
    message: "Save this note: Need to fix the bug in memory retrieval system. Issue: sometimes returns irrelevant results when querying with similar keywords. Location: Home office, Category: task, Secrecy: private"
  },
  {
    message: "Save this note: Great podcast episode about AI memory systems: https://lexfridman.com/podcast/. Key points: importance of context and temporal memory. Location: Train, Category: learning, Secrecy: public"
  },
  {
    message: "Save this note: Idea for new feature: Add support for voice notes and automatic transcription in the memory system. Could use Azure Speech Services. Location: Office, Category: idea, Secrecy: private"
  },
  {
    message: "Save this note: Need to prepare presentation for next week's team meeting. Topic: Memory system architecture and future roadmap. Location: Home office, Category: task, Secrecy: private"
  },
  {
    message: "Save this note: Found a great resource for LangGraph state management: https://python.langchain.com/docs/langgraph. Should implement similar patterns in our system. Location: Home, Category: learning, Secrecy: public"
  }
];

async function createMemory(memory) {
  try {
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memory)
    });

    const data = await response.json();
    console.log(`Memory created: ${memory.message.substring(0, 50)}...`);
    console.log('Response:', data);
    console.log('---');
  } catch (error) {
    console.error('Error creating memory:', error);
  }
}

async function createAllMemories() {
  console.log('Starting to create memories...\n');
  
  for (const memory of memories) {
    await createMemory(memory);
    // Add a small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\nFinished creating memories!');
}

createAllMemories(); 