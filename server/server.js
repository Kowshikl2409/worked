import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { extractIntent } from './services/groqService.js';
import * as orderController from './controllers/orderController.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
const DATA_FILE = path.join(__dirname, 'data/orders.json');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to load/save orders directly for the chat endpoint
function loadOrdersDirect() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return [];
}

function saveOrdersDirect(orders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
}

// REST endpoints for Orders
app.get('/api/orders', orderController.getAllOrders);
app.post('/api/orders', orderController.createOrder);
app.patch('/api/orders/:id', orderController.updateOrder);
app.delete('/api/orders/:id', orderController.deleteOrder);
app.post('/api/orders/:id/quality', orderController.addQualityNote);

// Unified Chat NLP Endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: "Message is required." });
  }

  try {
    // 1. NLP Extraction (calls Groq)
    const result = await extractIntent(message);
    const { intent } = result;

    let responseMessage = "I'm not sure how to process that request. Try saying something like 'I need 200 titanium flanges by July 20' or 'Mark order #1 as Accepted'.";
    let updatedOrders = loadOrdersDirect();
    let affectedOrder = null;

    // 2. Perform DB Mutation based on Intent
    if (intent === 'create_order') {
      // Validate quantity: must be a positive integer
      if (result.quantity !== null && result.quantity !== undefined) {
        const qty = parseInt(result.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          return res.json({
            success: true,
            message: `❌ Invalid quantity (${result.quantity}). Quantity must be a positive number. Please try again.`,
            extraction: result,
            orders: updatedOrders,
            affectedOrder: null
          });
        }
      }

      // Validate deadline: must not be in the past (compare using LOCAL date, not UTC)
      if (result.deadline) {
        // Parse the deadline string as a local-midnight date (YYYY-MM-DD → local Date)
        const [dlYear, dlMonth, dlDay] = result.deadline.split('-').map(Number);
        const deadlineLocal = new Date(dlYear, dlMonth - 1, dlDay); // local midnight

        // Today at local midnight
        const todayLocal = new Date();
        todayLocal.setHours(0, 0, 0, 0);

        if (deadlineLocal < todayLocal) {
          const dl = deadlineLocal.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          return res.json({
            success: true,
            message: `❌ Cannot create an order with a past deadline (${dl}). Please provide today or a future date.`,
            extraction: result,
            orders: updatedOrders,
            affectedOrder: null
          });
        }
      }

      // Default deadline to today (LOCAL date) if not provided
      const nowLocal = new Date();
      const todayDateStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
      const resolvedDeadline = result.deadline || todayDateStr;

      const nextId = updatedOrders.length > 0 ? Math.max(...updatedOrders.map(o => o.id)) + 1 : 1;
      affectedOrder = {
        id: nextId,
        part_name: result.part_name || null,
        material: result.material || null,
        quantity: result.quantity ? parseInt(result.quantity, 10) : null,
        deadline: resolvedDeadline,
        dimensions: result.dimensions || null,
        status: "Received",
        quality_notes: [],
        notes: result.notes || null,
        created_at: new Date().toISOString()
      };
      
      updatedOrders.push(affectedOrder);
      saveOrdersDirect(updatedOrders);

      // human-readable date formatting
      const dateStr = new Date(resolvedDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
      const wasDefaulted = !result.deadline;
      
      const quantityText = affectedOrder.quantity || '';
      const materialText = affectedOrder.material || '';
      const partText = affectedOrder.part_name || '';
      const details = [quantityText, materialText, partText].filter(Boolean).join(' ');

      responseMessage = `✅ Order #${affectedOrder.id} created successfully.${details ? ' ' + details : ''} — deadline ${dateStr}${wasDefaulted ? ' (defaulted to today)' : ''}.`;

    } else if (intent === 'update_status') {
      const orderId = parseInt(result.order_id, 10);
      const orderIndex = updatedOrders.findIndex(o => o.id === orderId);

      if (orderIndex !== -1) {
        updatedOrders[orderIndex].status = result.status;
        saveOrdersDirect(updatedOrders);
        affectedOrder = updatedOrders[orderIndex];
        
        responseMessage = `Status updated to ${result.status}.`;
      } else {
        responseMessage = `Order #${orderId} was not found.`;
      }

    } else if (intent === 'quality_update') {
      const orderId = parseInt(result.order_id, 10);
      const orderIndex = updatedOrders.findIndex(o => o.id === orderId);

      if (orderIndex !== -1) {
        const newNote = {
          note: result.quality_note,
          timestamp: new Date().toISOString()
        };
        updatedOrders[orderIndex].quality_notes.push(newNote);
        saveOrdersDirect(updatedOrders);
        affectedOrder = updatedOrders[orderIndex];

        responseMessage = `Quality inspection note added successfully.`;
      } else {
        responseMessage = `Order #${orderId} was not found.`;
      }

    } else if (intent === 'edit_order') {
      const orderId = parseInt(result.order_id, 10);
      const orderIndex = updatedOrders.findIndex(o => o.id === orderId);

      if (orderIndex !== -1) {
        const order = updatedOrders[orderIndex];
        const changes = [];
        
        if (result.part_name !== null && result.part_name !== undefined) {
          order.part_name = result.part_name;
          changes.push(`part name to "${result.part_name}"`);
        }
        if (result.material !== null && result.material !== undefined) {
          order.material = result.material;
          changes.push(`material to "${result.material}"`);
        }
        if (result.quantity !== null && result.quantity !== undefined) {
          const newQty = parseInt(result.quantity, 10);
          if (isNaN(newQty) || newQty <= 0) {
            return res.json({
              success: true,
              message: `❌ Invalid quantity (${result.quantity}). Quantity must be a positive number.`,
              extraction: result,
              orders: updatedOrders,
              affectedOrder: null
            });
          }
          order.quantity = newQty;
          changes.push(`quantity to ${newQty}`);
        }
        if (result.deadline !== null && result.deadline !== undefined) {
          order.deadline = result.deadline;
          const dateStr = new Date(result.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
          changes.push(`deadline to ${dateStr}`);
        }
        if (result.dimensions !== null && result.dimensions !== undefined) {
          order.dimensions = result.dimensions;
          changes.push(`dimensions to "${result.dimensions}"`);
        }

        if (changes.length > 0) {
          saveOrdersDirect(updatedOrders);
          affectedOrder = order;
          responseMessage = `Order #${orderId} ${changes.join(', ')} updated successfully.`;
        } else {
          responseMessage = `No modifications specified for Order #${orderId}.`;
        }
      } else {
        responseMessage = `Order #${orderId} was not found.`;
      }

    } else if (intent === 'delete_order') {
      const orderId = parseInt(result.order_id, 10);
      const orderExists = updatedOrders.some(o => o.id === orderId);

      if (orderExists) {
        responseMessage = `Please confirm deletion of Order #${orderId}.`;
      } else {
        responseMessage = `Order #${orderId} was not found.`;
      }

    } else if (intent === 'query_orders') {
      const filter = result.status_filter;
      if (filter) {
        responseMessage = `Filtering orders by status: ${filter}.`;
      } else {
        responseMessage = `Clearing filters to show all orders.`;
      }
    } else if (result.message) {
      responseMessage = result.message;
    }

    // Return response
    res.json({
      success: true,
      message: responseMessage,
      extraction: result,
      orders: updatedOrders,
      affectedOrder
    });

  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process conversational instruction.",
      message: "An internal server error occurred while processing your message."
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`AI Manufacturing Operations Server running on http://localhost:${PORT}`);
});
