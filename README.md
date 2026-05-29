# ForgeFlow AI

AI-powered manufacturing workflow platform that enables users to create, manage, and track production orders using natural language.

## 🚀 Features

* Natural language order creation
* AI-powered NLP extraction using Groq LLM
* Manufacturing order management dashboard
* Order status updates (Received, In Review, Accepted)
* Edit and delete orders
* Multi-order extraction from a single message
* Authentication with Clerk
* Real-time notifications
* Search and filter functionality
* Responsive modern SaaS UI

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Vite

### Backend

* Node.js
* Express.js

### AI & Authentication

* Groq API (Llama 3.3 70B Versatile)
* Clerk Authentication

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## 📌 Example Commands

Create orders using natural language:

```text
Create 50 titanium brackets due June 17.
```

```text
Need 100 aluminum rods by July 10.
```

```text
Create 25 steel shafts and 40 titanium flanges due August 15.
```

The AI automatically extracts:

* Part Name
* Material
* Quantity
* Dimensions
* Deadline
* Status Information

and creates structured manufacturing orders.

---

## 🔐 Authentication

ForgeFlow AI uses Clerk for:

* Sign Up
* Sign In
* Session Management
* Protected Dashboard Access

---

## 📷 Screenshots

### Landing Page

(Add screenshot here)

### Dashboard

(Add screenshot here)

### Order Management

(Add screenshot here)

---

## 🏗️ Project Structure

```text
ForgeFlow-AI/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

### Backend

```env
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

### Frontend

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=your_backend_url
```

---

## 🚀 Local Setup

Clone the repository:

```bash
git clone <repository-url>
cd ForgeFlow-AI
```

Install frontend dependencies:

```bash
cd client
npm install
npm run dev
```

Install backend dependencies:

```bash
cd server
npm install
npm start
```

---

## 🎯 Learning Outcomes

This project helped me gain practical experience in:

* Full-Stack Development
* AI Integration with LLMs
* NLP-Based Data Extraction
* Authentication & Authorization
* Git & GitHub Workflows
* Production Deployment
* API Integration
* Modern SaaS UI Design

---



## 📄 License

This project is developed for educational and portfolio purposes.
