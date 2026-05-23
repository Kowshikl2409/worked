import { Groq } from 'groq-sdk';
import { parseDeadline } from '../utils/dateParser.js';

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are a manufacturing operations extraction engine. Analyze the user message and extract details into a structured JSON response.
Do not include any conversational text or markdown blocks (like \`\`\`json). Return raw JSON only.

Supported Intents & Schema:

1. "create_order":
   - intent: "create_order"
   - part_name: string or null (Only extract if explicitly mentioned. Do not guess, do not use generic placeholders)
   - material: string or null (Only extract if mentioned)
   - quantity: number or null (Only extract if mentioned)
   - deadline: string or null (Extract the date exactly as written, e.g., "June 17", "July 20")
   - dimensions: string or null (Only extract if mentioned)
   - notes: string or null (Any custom instructions)

2. "update_status":
   - intent: "update_status"
   - order_id: number or null (Extract the order ID)
   - status: string or null (Must be exactly one of: "Received", "In Review", "Accepted")

3. "quality_update":
   - intent: "quality_update"
   - order_id: number or null
   - quality_note: string or null

4. "query_orders":
   - intent: "query_orders"
   - status_filter: string or null (Must be exactly one of: "Received", "In Review", "Accepted")

5. "edit_order":
   - intent: "edit_order"
   - order_id: number or null (Extract the target order ID to update)
   - part_name: string or null (Only extract if the user specifies a change/update for it)
   - material: string or null (Only extract if the user specifies a change/update for it)
   - quantity: number or null (Only extract if the user specifies a change/update for it)
   - deadline: string or null (Only extract if the user specifies a change/update for it)
   - dimensions: string or null (Only extract if the user specifies a change/update for it)

6. "delete_order":
   - intent: "delete_order"
   - order_id: number or null (Extract the target order ID to delete)

Rules:
- If a field is not explicitly requested for creation or modification, set it to null.
- If no supported intent matches the user message, return: { "intent": null, "message": "Could not understand conversational request." }`;

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
    max_tokens: 450,
    response_format: { type: 'json_object' }
  });

  const responseText = response.choices[0]?.message?.content || '{}';
  const extractedData = JSON.parse(responseText);

  // Post-process dates for create_order and edit_order
  if ((extractedData.intent === 'create_order' || extractedData.intent === 'edit_order') && extractedData.deadline) {
    extractedData.deadline = parseDeadline(extractedData.deadline);
  }

  return {
    ...extractedData,
    is_fallback: false
  };
}
