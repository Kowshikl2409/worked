import { Groq } from 'groq-sdk';
import { parseDeadline } from '../utils/dateParser.js';

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are a manufacturing operations extraction engine. Analyze the user message and extract details into a structured JSON response.
Do not include any conversational text or markdown blocks (like \`\`\`json). Return raw JSON only.

Supported Intents & Schema:

1. "create_order" -- when user requests a SINGLE order:
   - intent: "create_order"
   - part_name: string or null
   - material: string or null
   - quantity: number or null
   - deadline: string or null (e.g. "July 20", "June 17")
   - dimensions: string or null
   - notes: string or null

2. "create_multiple_orders" -- when user requests TWO OR MORE orders in one message:
   - intent: "create_multiple_orders"
   - orders: array of order objects, each with:
       { "part_name": ..., "material": ..., "quantity": ..., "deadline": ..., "dimensions": ..., "notes": ... }
     (use null for any field not mentioned for that specific order)

3. "update_status":
   - intent: "update_status"
   - order_id: number or null
   - status: string or null (Must be exactly one of: "Received", "In Review", "Accepted")

4. "quality_update":
   - intent: "quality_update"
   - order_id: number or null
   - quality_note: string or null

5. "query_orders":
   - intent: "query_orders"
   - status_filter: string or null (Must be exactly one of: "Received", "In Review", "Accepted")

6. "edit_order":
   - intent: "edit_order"
   - order_id: number or null
   - part_name: string or null
   - material: string or null
   - quantity: number or null
   - deadline: string or null
   - dimensions: string or null

7. "delete_order":
   - intent: "delete_order"
   - order_id: number or null

Rules:
- If the message mentions multiple separate orders (different parts, materials, or quantities with separate deadlines), always use "create_multiple_orders".
- If a field is not explicitly mentioned, set it to null.
- If no supported intent matches, return: { "intent": null, "message": "Could not understand conversational request." }`;

/**
 * Extracts structured data from user messages using Groq Llama-3.
 * @param {string} message - The user's input message
 * @returns {Promise<object>} - Structured extraction JSON
 */
export async function extractIntent(message) {
  const trimmedMessage = message.trim();

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined in environment variables.");
  }

  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: trimmedMessage }
    ],
    temperature: 0.0,
    max_tokens: 800,
    response_format: { type: 'json_object' }
  });

  const responseText = response.choices[0]?.message?.content || '{}';
  const extractedData = JSON.parse(responseText);

  // Post-process dates for single create_order / edit_order
  if ((extractedData.intent === 'create_order' || extractedData.intent === 'edit_order') && extractedData.deadline) {
    extractedData.deadline = parseDeadline(extractedData.deadline);
  }

  // Post-process dates for each order in create_multiple_orders
  if (extractedData.intent === 'create_multiple_orders' && Array.isArray(extractedData.orders)) {
    extractedData.orders = extractedData.orders.map(order => ({
      ...order,
      deadline: order.deadline ? parseDeadline(order.deadline) : null
    }));
  }

  return {
    ...extractedData,
    is_fallback: false
  };
}
