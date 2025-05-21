import fetch from 'node-fetch';

const testQueries = [
  // Location-based queries
  "What memories do I have from the coffee shop?",
  "Show me all memories from the train",
  "What did I save while at home?",
  
  // Category-based queries
  "What tasks do I need to do?",
  "Show me all my ideas",
  "What research have I saved?",
  
  // Content-based queries
  "What do I know about Kernel Memory?",
  "Show me memories about LangGraph",
  "What did I save about vector databases?",
  
  // Time-based queries
  "What memories do I have from October 4th?",
  "Show me memories from last week",
  
  // Combined queries
  "What tasks do I have at the office?",
  "Show me confidential memories from meetings",
  "What research did I do on the train?",
  
  // Specific memory queries
  "What was the startup idea I had?",
  "What's the book John recommended?",
  "When is my water bill due?"
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
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\nFinished running tests!');
}

runTests(); 