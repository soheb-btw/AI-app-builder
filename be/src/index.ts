import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";

const app = express();

// Restrict CORS to known frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

/* 
 * TEMPORARILY COMMENTED OUT SERVER-SIDE API KEY USAGE:
 * The backend now enforces Bring-Your-Own-Key (BYOK) from the frontend header 'x-openrouter-key'.
 *
 * const openrouter = new OpenAI({
 *   baseURL: "https://openrouter.ai/api/v1",
 *   apiKey: process.env.OPENROUTER_API_KEY || "",
 *   defaultHeaders: {
 *     "X-Title": "BuildBot",
 *   },
 * });
 */

const MODELS = (process.env.OPENROUTER_MODELS || "google/gemini-2.5-flash-lite,anthropic/claude-haiku-4.5,meta-llama/llama-3-8b-instruct:free")
  .split(",")
  .map((m) => m.trim());
const DEFAULT_MODEL = MODELS[0];
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || "10000", 10);
const PORT = parseInt(process.env.PORT || "3001", 10);

// Helper to construct OpenRouter client per request from user header
function getOpenRouterClient(userApiKey: string) {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: userApiKey,
    defaultHeaders: {
      "X-Title": "BuildBot",
    },
  });
}

app.post("/template", async (req, res) => {
  try {
    const userApiKey = req.headers["x-openrouter-key"] as string;
    const requestedModel = (req.headers["x-openrouter-model"] as string) || DEFAULT_MODEL;

    // Enforce user API key from frontend
    if (!userApiKey || !userApiKey.trim()) {
      res.status(401).json({ message: "OpenRouter API Key is required. Please set your API key in the app settings." });
      return;
    }

    const prompt = req.body.prompt;

    // Input validation
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ message: "A non-empty 'prompt' field is required." });
      return;
    }

    const openrouter = getOpenRouterClient(userApiKey.trim());

    const result = await openrouter.chat.completions.create({
      model: requestedModel,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "system",
          content: `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra`,
        },
        { role: "user", content: prompt },
      ],
    });

    // Normalize: trim whitespace, take first line, lowercase
    const rawAnswer = result.choices[0]?.message?.content || "";
    const answer = rawAnswer.split("\n")[0].trim().toLowerCase();

    if (answer === "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }

    if (answer === "node") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    }

    res.status(403).json({ message: `Unexpected model response: ${answer}` });
  } catch (error: any) {
    console.error("Template endpoint error:", error?.message || error);
    const statusCode = error?.status || error?.statusCode || 500;
    res.status(statusCode).json({ message: error?.message || "Internal server error" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const userApiKey = req.headers["x-openrouter-key"] as string;
    const requestedModel = (req.headers["x-openrouter-model"] as string) || DEFAULT_MODEL;

    // Enforce user API key from frontend
    if (!userApiKey || !userApiKey.trim()) {
      res.status(401).json({ message: "OpenRouter API Key is required. Please set your API key in the app settings." });
      return;
    }

    const messages = req.body.messages;

    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: "A non-empty 'messages' array is required." });
      return;
    }

    const openrouter = getOpenRouterClient(userApiKey.trim());

    // Build OpenAI-compatible messages with system prompt
    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: getSystemPrompt() },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    const result = await openrouter.chat.completions.create({
      model: requestedModel,
      max_tokens: MAX_TOKENS,
      messages: chatMessages,
    });

    const response = result.choices[0]?.message?.content || "";

    res.json({
      response: response,
    });
  } catch (error: any) {
    console.error("Chat endpoint error:", error?.message || error);
    const statusCode = error?.status || error?.statusCode || 500;
    res.status(statusCode).json({ message: error?.message || "Internal server error" });
  }
});

// Expose available models
app.get("/models", (_req, res) => {
  res.json({ models: MODELS, default: DEFAULT_MODEL });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
