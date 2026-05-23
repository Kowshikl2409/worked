# AI Manufacturing Operations Platform

## Nova Nexus Hackathon 2025

Modern AI-powered conversational manufacturing order management system.

---

# Project Overview

This project is a web-based AI manufacturing operations platform where users interact entirely through natural language.

The system allows users and operations teams to:

- Create manufacturing orders through chat
- Update order status through natural language
- Add quality inspection notes through conversation
- Track all orders through a modern dashboard
- Filter and query manufacturing orders intelligently

The platform focuses on:

- Accurate NLP extraction
- Token-efficient AI architecture
- Modern industrial UI/UX
- Fast real-time dashboard updates
- Lightweight architecture
- Clean and scalable frontend/backend structure

---

# Updated Technical Direction

## Final Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide Icons

### Backend
- Express.js
- Node.js

### Authentication
- Clerk Authentication
- Google Login
- Email Login

### AI / NLP
- Groq API
- Llama 3 model

### Date Parsing
- chrono-node

### State / Storage
- localStorage persistence
- Lightweight frontend state management

### Deployment
- Vercel (Frontend)
- Render / Railway (Backend)

---

# Why Vite Instead of Next.js

The project intentionally uses Vite instead of Next.js because:

- Faster development startup
- Simpler project structure
- Lightweight architecture
- Better suited for hackathon demos
- No SSR required
- Easier deployment and debugging

---

# Core Hackathon Problem Statement

Precision manufacturing companies currently manage complex workflows through:

- Emails
- Calls
- Spreadsheets
- Manual updates

This creates:

- Slow workflows
- Poor scalability
- Communication gaps
- Tracking difficulties

The goal of this platform is to replace those workflows with a single conversational AI-driven interface.

---

# Core Features

## 1. Conversational Order Creation

Users can create manufacturing orders using plain English.

### Example

```txt
I need 200 titanium flanges, 80mm bore, delivered by July 20
```

### Extracted Data

- Part Name
- Material
- Quantity
- Deadline
- Dimensions
- Notes

### Generated Order

```json
{
  "part_name": "Titanium Flange",
  "material": "Titanium",
  "quantity": 200,
  "deadline": "2026-07-20",
  "dimensions": "80mm bore"
}
```

---

## 2. Order Status Updates

Users or operations teams can update order status through natural language.

### Example

```txt
Mark order #3 as accepted
```

### Supported Status Flow

```txt
Received → In Review → Accepted
```

### Allowed Statuses

- Received
- In Review
- Accepted

---

## 3. Quality Inspection Updates

Operations teams can log quality inspection notes through conversation.

### Example

```txt
Quality update on order #3 — passed visual inspection with no surface defects
```

### Features

- Timestamped quality logs
- Persistent quality history
- Latest inspection visibility on dashboard

---

## 4. Order Tracking Dashboard

A modern dashboard displays all manufacturing orders.

### Dashboard Includes

- Order ID
- Part Name
- Material
- Quantity
- Deadline
- Current Status
- Latest Quality Note
- Created Timestamp

### Dashboard Features

- Status badges
- Live updates
- Search functionality
- Status filters
- Responsive design
- Smooth animations

---

## 5. Multi-Order Query Support (Bonus)

The platform supports intelligent order filtering.

### Examples

```txt
Show all accepted orders
```

```txt
Show orders in review
```

```txt
Show pending orders
```

---

# AI / NLP Architecture

## Important Design Philosophy

The AI is NOT designed as a conversational chatbot.

Instead, the AI acts as a:

# Structured Extraction Engine

This improves:

- Accuracy
- Token efficiency
- Speed
- Reliability
- Scalability

---

# NLP Workflow

```txt
User enters message
        ↓
User clicks SEND
        ↓
Frontend sends request to backend
        ↓
Express backend calls Groq API
        ↓
Llama 3 extracts structured JSON
        ↓
Backend validates response
        ↓
chrono-node parses dates
        ↓
Dashboard updates instantly
```

---

# Why Groq Instead of Gemini

The updated architecture uses Groq + Llama 3 instead of Gemini because:

- Faster response time
- Better structured JSON extraction
- Lower latency
- Better token efficiency
- Cleaner extraction responses
- More reliable for hackathon demos

---

# Recommended Model

```txt
llama-3.3-70b-versatile
```

Alternative:

```txt
meta-llama/llama-4-scout
```

---

# Small Prompt Strategy

The project intentionally uses very small prompts.

## Reason

This improves:

- Token efficiency
- Speed
- Cost
- Accuracy

---

# Recommended Prompt

```txt
Extract manufacturing order data.

Return JSON only.

Supported intents:
- create_order
- update_status
- quality_update
- query_orders

Message:
{{message}}
```

---

# Supported Intents

## Create Order

```json
{
  "intent": "create_order",
  "part_name": "Titanium Flange",
  "material": "Titanium",
  "quantity": 200,
  "deadline": "2026-07-20",
  "dimensions": "80mm bore",
  "notes": null
}
```

---

## Update Status

```json
{
  "intent": "update_status",
  "order_id": 3,
  "status": "Accepted"
}
```

---

## Quality Update

```json
{
  "intent": "quality_update",
  "order_id": 3,
  "quality_note": "Passed visual inspection"
}
```

---

## Query Orders

```json
{
  "intent": "query_orders",
  "status_filter": "Accepted"
}
```

---

# Date Parsing System

The system uses chrono-node for natural language date parsing.

## Features

- Extracts dates from plain English
- Handles relative dates
- Supports missing year handling
- Converts dates into structured ISO format

---

# Missing Year Logic

If the user does not specify a year:

```txt
Deliver by July 20
```

The backend automatically uses:

```txt
2026-07-20
```

This ensures consistent structured storage.

---

# Authentication System

The platform uses Clerk Authentication.

## Features

- Google Login
- Email Login
- Session handling
- Protected routes
- User management

## Protected Pages

- Dashboard
- Chat interface
- Order management

## Public Pages

- Landing page
- Sign in page

---

# Updated UI/UX Direction

## Critical UI Update

The current generated dashboard UI is NOT aligned with the intended Optimus-inspired template direction.

The project should strictly follow the UI style and layout inspired by:

https://v0-optimus-delta.vercel.app/

The design must remain:

- Simple
- Clean
- Minimal
- Modern
- Professional
- Spacious
- Optimus-inspired

The UI should NOT feel:

- Over-engineered
- Overcrowded
- Cyberpunk-heavy
- Enterprise ERP-like
- Widget overloaded
- Visually noisy

---

# Desired UI Reference Behaviour

## Landing Page

The landing page should closely resemble the Optimus template style.

### Required Characteristics

- Large centered hero section
- Clean typography
- Minimal UI clutter
- Strong spacing hierarchy
- Blue/purple gradient accents
- Smooth dark background gradients
- Minimal floating effects
- Premium SaaS appearance
- Clean navbar
- Responsive layout

### Required Landing Flow

1. User opens landing page
2. User clicks "Sign In to Start"
3. Clerk authentication page opens
4. After successful login:
   - user returns back to landing page
   - NOT directly to dashboard
5. Landing page button changes to:

```txt
Open Dashboard
```

6. Clicking that button opens the chatbot/dashboard page.

---

# Theme Requirements

## Dark Mode Default

The application must open in dark mode by default.

---

## Theme Toggle

A clean modern theme toggle must exist.

Requirements:

- Top navbar placement
- Smooth transitions
- Maintain Optimus-inspired aesthetics
- Light mode should remain clean and minimal
- Avoid overly bright colors

---

# Dashboard UI Direction

The chatbot/dashboard page should visually resemble the FIRST dashboard mockups provided by the user.

The currently generated UI is TOO crowded and contains:

- unnecessary metrics
- fake telemetry widgets
- fake operational modules
- overbuilt industrial cards
- excessive labels
- unnecessary prebuilt content

These MUST be removed.

---

# Remove These UI Elements

## Remove Fake Operational Modules

Do NOT include:

- Operations Metrics
- Fake telemetry systems
- Asset cycle labels
- Fake compliance indicators
- Fake AI system labels
- Fake console timestamps
- Fake manufacturing telemetry
- Unnecessary side widgets
- Overly futuristic decorations

---

# Keep The Dashboard Minimal

The dashboard should contain ONLY:

## Left Side

### Chat Panel

Contains:

- AI assistant messages
- User chat messages
- Input box
- Send button
- Loading state
- Suggested prompts (minimal)

---

## Right Side

### Orders Section

Contains:

- Search bar
- Status filters
- Order cards
- Latest quality note
- Current status badge

---

# Correct Dashboard Philosophy

The dashboard should feel like:

- AI-powered manufacturing SaaS
- Modern workflow tool
- Lightweight operations platform
- Clean production dashboard

NOT:

- sci-fi military UI
- hacking simulator
- telemetry command center
- overloaded analytics platform

---

# Correct Visual Style

## Typography

Use:

- Large clean headings
- Minimal uppercase usage
- Balanced spacing
- Modern sans-serif fonts

Avoid:

- excessive technical labels
- unnecessary tiny text
- cluttered metadata

---

## Cards

Cards should:

- have clean borders
- soft shadows
- rounded corners
- subtle hover effects
- readable spacing

Avoid:

- over-segmented layouts
- too many divider lines
- excessive glow effects

---

## Colors

Maintain:

- dark navy background
- subtle gradients
- blue accent colors
- purple accent highlights
- soft gray text

Avoid:

- neon overload
- harsh glows
- distracting animations

---

# Correct Dashboard Layout

```txt
------------------------------------------------
| Sidebar | Chat Panel | Orders Dashboard      |
|          |            |                       |
|          |            | Order Cards           |
|          |            | Filters               |
|          |            | Search                |
------------------------------------------------
```

---

# Sidebar Requirements

Sidebar should remain minimal.

Include ONLY:

- Dashboard
- Orders
- Quality Logs
- Theme Toggle
- User Profile

Avoid:

- fake operational tabs
- telemetry tabs
- metrics spam

---

# Chat Experience

The chat UI should visually resemble:

- ChatGPT-style spacing
- modern AI assistant UI
- clean conversational design

The assistant should appear:

- helpful
- structured
- minimal
- professional

---

# Suggested Prompt Buttons

Minimal quick prompts are allowed.

Example:

```txt
Create manufacturing order
```

```txt
Update order status
```

```txt
Add quality inspection
```

Avoid long prebuilt fake examples.

---

# Important UX Requirement

The AI extraction must trigger ONLY when the user clicks SEND.

There should be:

- no auto listening
- no continuous voice processing
- no background recording
- no autonomous AI execution

---

# Landing Page Improvements

The landing page should:

- strongly resemble the Optimus template
- have cleaner spacing
- maintain centered hero content
- use smooth dark gradients
- include a single primary CTA
- avoid excessive cards/widgets

---

# Final UI Goal

The final UI should feel like:

- a real startup SaaS product
- modern AI operations software
- premium but minimal dashboard
- production-ready interface
- clean manufacturing workflow platform

NOT like a prebuilt admin template with random widgets.

---

# Dashboard Design Direction

## UI Style

The dashboard should feel:

- Modern
- Industrial
- Futuristic
- Professional
- Minimal
- Fast

---

# Design Inspiration

Inspired by:

- Linear
- OpenAI Dashboard
- Modern SaaS dashboards
- Industrial operations systems

---

# Layout Structure

```txt
------------------------------------------------
| Sidebar | Chat Panel | Orders Dashboard      |
|          |            |                       |
|          |            | Order Cards           |
|          |            | Status Metrics        |
|          |            | Timeline              |
------------------------------------------------
```

---

# Main Dashboard Sections

## Sidebar

Contains:

- Navigation
- Filters
- User profile
- Logout
- Theme toggle

---

## Chat Panel

Features:

- User messages
- AI/system responses
- Send button
- Loading indicator
- Modern chat UI

Important:

The AI request is triggered ONLY when the user clicks SEND.

No:

- background listening
- continuous recording
- automatic AI execution
- voice capture

---

## Orders Dashboard

Displays:

- Live order cards
- Status badges
- Quality notes
- Search and filters
- Timeline information

---

# Suggested Color Palette

## Primary Colors

- Dark Blue
- Slate
- Black
- White

## Status Colors

### Received
Gray

### In Review
Orange / Yellow

### Accepted
Green

---

# Frontend Folder Structure

```txt
client/
 ├── src/
 │    ├── components/
 │    ├── pages/
 │    ├── layouts/
 │    ├── hooks/
 │    ├── services/
 │    ├── utils/
 │    ├── types/
 │    └── lib/
```

---

# Backend Folder Structure

```txt
server/
 ├── routes/
 ├── controllers/
 ├── services/
 ├── middleware/
 ├── utils/
 └── config/
```

---

# Suggested API Routes

## Chat Extraction

```txt
POST /api/chat
```

Responsibilities:

- Receive user message
- Call Groq API
- Extract structured JSON
- Validate data
- Parse dates
- Return response

---

## Orders

```txt
GET /api/orders
POST /api/orders
PATCH /api/orders/:id
```

---

# Persistence Strategy

The project intentionally avoids MongoDB for hackathon simplicity.

Instead it uses:

- localStorage
- lightweight frontend persistence

Benefits:

- Faster setup
- Simpler architecture
- Easier debugging
- Faster demos
- Less deployment complexity

---

# Error Handling

## AI Failures

If the AI fails:

- Show fallback message
- Preserve dashboard state
- Avoid app crashes
- Retry extraction if needed

Optional:

- Regex fallback parsing

---

# Performance Goals

## Token Efficiency

The platform minimizes AI token usage through:

- Stateless extraction
- Tiny prompts
- JSON-only responses
- No unnecessary conversation history
- Single-message processing

---

# Security / Development Notes

## Antigravity IDE Cleanup

Telemetry was disabled in Antigravity IDE.

The new project should:

- Avoid recording generation
- Avoid unnecessary artifacts
- Avoid large cache files
- Use clean .gitignore rules

---

# Recommended .gitignore

```gitignore
node_modules
.env
.dist
build

recordings/
artifacts/
logs/
.cache/
.sessions/
tmp/

*.mp4
*.webm
*.wav
*.log
```

---

# Recommended Packages

## Frontend

```bash
npm install react-router-dom
npm install tailwindcss
npm install framer-motion
npm install lucide-react
```

---

## Backend

```bash
npm install express cors dotenv
npm install groq-sdk
npm install chrono-node
```

---

# Deployment Strategy

## Frontend

Deploy using:

- Vercel

## Backend

Deploy using:

- Render
- Railway

---

# Demo Flow

## Suggested Presentation Flow

1. User signs in
2. Create manufacturing order through chat
3. Dashboard updates automatically
4. Move order to In Review
5. Mark order as Accepted
6. Add quality inspection note
7. Filter accepted orders
8. Explain token-efficient architecture
9. Explain Groq + Llama extraction flow

---

# Final Goal

Build a modern AI-powered manufacturing operations platform that demonstrates:

- Accurate NLP extraction
- Efficient AI architecture
- Excellent UI/UX
- Reliable workflow handling
- Real-time updates
- Professional dashboard design
- Scalable conversational operations

---

# Project Vision

This project is designed not just as a hackathon submission, but as a production-inspired industrial SaaS platform that modernizes manufacturing workflows using lightweight AI-powered conversational interfaces.

