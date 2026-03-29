require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/guestbook";

const messageSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true, maxlength: 80 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.get("/api/messages", async (_req, res) => {
  try {
    const items = await Message.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { author, body } = req.body || {};
    const doc = await Message.create({ author, body });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid message" });
  }
});

async function connectWithRetry(uri, attempts = 30) {
  const delayMs = 2000;
  for (let i = 0; i < attempts; i++) {
    try {
      await mongoose.connect(uri);
      return;
    } catch (err) {
      console.warn(
        `MongoDB not ready (${i + 1}/${attempts}):`,
        err.message || err
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error("Could not connect to MongoDB");
}

async function main() {
  await connectWithRetry(MONGODB_URI);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
