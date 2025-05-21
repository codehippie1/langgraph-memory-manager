import fetch from 'node-fetch';

const testQueries = [
  // Location-based queries
  "What memories did I save while I was at the coffee shop?",
  "Do I have any saved notes from the train rides?",
  "Which memories were created at home?",

  // Category-based queries
  "What tasks are pending for me to complete?",
  "Show me the ideas I’ve captured so far.",
  "What research notes have I saved recently?",

  // Content-based queries
  "What do I know about Microsoft Kernel Memory?",
  "What memories reference LangGraph or LangChain?",
  "Have I saved anything about vector databases like Pinecone?",

  // Time-based queries
  "Do I have any memories from October 4th?",
  "Which notes did I save last week?",

  // Combined queries
  "Which tasks are tagged with the office as their location?",
  "Do I have confidential memories related to meetings?",
  "What research did I collect while commuting on the train?",

  // Specific memory queries
  "What was the AI startup idea I wrote down?",
  "Which book did John recommend about human memory?",
  "When is my water bill due and how much is it?"
];

async function testQuery(query) {
  try {
    console.log(`\nTesting query: "${query}"`);
    console.log('---');

    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: query })
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing query:', error);
  }
}

async function runTests() {
  console.log('Starting memory retrieval tests...\n');

  for (const query of testQueries) {
    await testQuery(query);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\nFinished running tests!');
}

runTests();