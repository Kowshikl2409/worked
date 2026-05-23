import { extractIntent } from './services/groqService.js';
import { parseDeadline } from './utils/dateParser.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runTests() {
  console.log("=== RUNNING NLP EXTRACTION TESTS ===\n");

  const testCases = [
    {
      name: "Create Order (simple relative date)",
      input: "I need 250 aluminum brackets by next Friday",
      expectedIntent: "create_order"
    },
    {
      name: "Create Order (with dimensions and specific date)",
      input: "Please order 50 titanium flanges with an 80mm bore for delivery by July 20",
      expectedIntent: "create_order"
    },
    {
      name: "Update Status (lowercase accepted)",
      input: "Mark order #3 as accepted",
      expectedIntent: "update_status"
    },
    {
      name: "Update Status (in review)",
      input: "set order 12 status to in review",
      expectedIntent: "update_status"
    },
    {
      name: "Quality Update",
      input: "Quality update on order #2 — passed visual inspection with zero defects",
      expectedIntent: "quality_update"
    },
    {
      name: "Query Orders (Accepted)",
      input: "Show all accepted orders",
      expectedIntent: "query_orders"
    }
  ];

  let passed = 0;
  for (const tc of testCases) {
    console.log(`Test: "${tc.name}"`);
    console.log(`Input: "${tc.input}"`);
    
    const result = await extractIntent(tc.input);
    console.log("Extracted:", JSON.stringify(result, null, 2));
    
    if (result.intent === tc.expectedIntent) {
      console.log("Result: PASS\n");
      passed++;
    } else {
      console.log(`Result: FAIL (Expected: ${tc.expectedIntent}, Got: ${result.intent})\n`);
    }
  }

  console.log("=== DATE PARSER TESTS ===");
  const dates = [
    { text: "July 20", expectContains: "2026-07-20" },
    { text: "2026-09-15", expectContains: "2026-09-15" }
  ];

  for (const d of dates) {
    const parsed = parseDeadline(d.text);
    console.log(`Text: "${d.text}" => Parsed: "${parsed}"`);
  }

  console.log(`\nTests Completed: ${passed}/${testCases.length} Intents passed.`);
}

runTests().catch(console.error);
