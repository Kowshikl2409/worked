import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

// Initialize with zero prebuilt/placeholder orders
const DEFAULT_ORDERS = [];

// Helper to load orders
function loadOrders() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_ORDERS, null, 2));
      return DEFAULT_ORDERS;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading orders file, using empty state:", error);
    return DEFAULT_ORDERS;
  }
}

// Helper to save orders
function saveOrders(orders) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing orders file:", error);
    return false;
  }
}

export function getAllOrders(req, res) {
  const orders = loadOrders();
  res.json({ success: true, orders });
}

export function createOrder(req, res) {
  const { part_name, material, quantity, deadline, dimensions, notes } = req.body;
  
  if (!quantity) {
    return res.status(400).json({ success: false, error: "Order quantity is required." });
  }

  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ success: false, error: "Quantity must be a positive number." });
  }

  const orders = loadOrders();
  const nextId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
  
  const newOrder = {
    id: nextId,
    part_name: part_name || null,
    material: material || null,
    quantity: parsedQty,
    deadline: deadline || null,
    dimensions: dimensions || null,
    status: "Received",
    quality_notes: [],
    notes: notes || null,
    created_at: new Date().toISOString()
  };

  orders.push(newOrder);
  saveOrders(orders);

  res.status(201).json({ success: true, order: newOrder, orders });
}

export function updateOrder(req, res) {
  const { id } = req.params;
  const { part_name, material, quantity, deadline, dimensions, status, notes } = req.body;
  const orderId = parseInt(id, 10);

  const orders = loadOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: `Order #${orderId} not found.` });
  }

  const order = orders[orderIndex];

  // Update provided fields
  if (part_name !== undefined) order.part_name = part_name;
  if (material !== undefined) order.material = material;
  if (quantity !== undefined) {
    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ success: false, error: "Quantity must be a positive number." });
    }
    order.quantity = parsedQty;
  }
  if (deadline !== undefined) order.deadline = deadline;
  if (dimensions !== undefined) order.dimensions = dimensions;
  if (notes !== undefined) order.notes = notes;
  
  if (status !== undefined) {
    const ALLOWED_STATUSES = ["Received", "In Review", "Accepted"];
    if (ALLOWED_STATUSES.includes(status)) {
      order.status = status;
    } else {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Allowed values are: ${ALLOWED_STATUSES.join(', ')}` 
      });
    }
  }

  saveOrders(orders);
  res.json({ success: true, order, orders });
}

export function deleteOrder(req, res) {
  const { id } = req.params;
  const orderId = parseInt(id, 10);

  const orders = loadOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: `Order #${orderId} not found.` });
  }

  const deletedOrder = orders[orderIndex];
  orders.splice(orderIndex, 1);
  saveOrders(orders);

  res.json({ success: true, message: `Order #${orderId} deleted successfully.`, orders, deletedOrder });
}

export function addQualityNote(req, res) {
  const { id } = req.params;
  const { quality_note } = req.body;
  const orderId = parseInt(id, 10);

  if (!quality_note) {
    return res.status(400).json({ success: false, error: "Quality note text is required." });
  }

  const orders = loadOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: `Order #${orderId} not found.` });
  }

  const newNote = {
    note: quality_note,
    timestamp: new Date().toISOString()
  };

  orders[orderIndex].quality_notes.push(newNote);
  saveOrders(orders);

  res.json({ success: true, order: orders[orderIndex], orders });
}
