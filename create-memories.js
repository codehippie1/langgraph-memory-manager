import fetch from 'node-fetch';

const memories = [
  {
    message: "Save this note: John recommended a fascinating book on how memory works — 'The Psychology of Memory' by Alan Baddeley. He said it’s a must-read if I want to design better AI memory. Location: Coffee shop, Category: learning, Secrecy: public"
  },
  {
    message: "Save this note: During lunch with Alan in Midtown, we had a deep conversation about AI ethics and how memory systems will affect future workplaces. I want to blog about this later. Location: NYC Midtown, Category: reflection, Secrecy: private"
  },
  {
    message: "Save this note: Startup idea — an AI assistant that passively captures user context and memories, then retrieves them on demand. Think LangGraph + Kernel Memory + geotagged recall. Location: Home office, Category: idea, Secrecy: confidential"
  },
  {
    message: "Save this note: Found a powerful blog on Kernel Memory's use in building RAG systems: https://devblogs.microsoft.com/semantic-kernel/kernel-memory-is-now-available/. Inspired me to explore hybrid memory layers. Location: Train, Category: research, Secrecy: public"
  },
  {
    message: "Save this note: Remind me to pay the water bill before Friday — it’s $85.23 and overdue. Better set a notification for Thursday night. Location: Home, Category: task, Secrecy: private"
  },
  {
    message: "Save this note: New feature idea — let users record voice notes that get transcribed and embedded as memories. Use Azure Speech for this. Voice is faster than typing. Location: Office, Category: idea, Secrecy: private"
  },
  {
    message: "Save this note: Email the team about next Monday’s quarterly review at 2 PM. Add the agenda and attach last quarter’s goals for reference. Location: Office, Category: task, Secrecy: private"
  },
  {
    message: "Save this note: Listened to a Lex Fridman episode on AI memory. Insightful stuff on temporal context and long-term state tracking: https://lexfridman.com/podcast/. Location: Train, Category: learning, Secrecy: public"
  },
  {
    message: "Save this note: Pitch meeting with a potential investor is tomorrow at 11 AM. I need to polish the demo and make sure the deck covers our AI memory differentiator. Location: Office, Category: meeting, Secrecy: confidential"
  },
  {
    message: "Save this note: Working on a blog post: 'How I’m Building My Second Brain with Kernel Memory and LangGraph'. It’ll dive into vector search, state handling, and note recall by location. Location: Home office, Category: idea, Secrecy: public"
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
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('\nFinished creating memories!');
}

createAllMemories();