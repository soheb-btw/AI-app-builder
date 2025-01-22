require("dotenv").config();
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { ContentBlock, TextBlock } from "@anthropic-ai/sdk/resources";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const anthropic = new Anthropic();
const app = express();
app.use(cors())
app.use(express.json())

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra`,
  });

  let result = await model.generateContent(prompt);
 
  const answer = result.response.text().split('\n')[0]; // react or node
  if (answer === "react") {
    res.json({
      prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompts: [reactBasePrompt]
    })
    return;
  }

  if (answer === "node") {
    res.json({
      prompts: [],
      uiPrompts: [nodeBasePrompt]
    })
    return;
  }

  res.status(403).json({ message: answer })
  return;

})

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: getSystemPrompt(),
  });
  let result = await model.generateContent(JSON.stringify(messages));
  const response = result.response.text(); // react or node
  res.json({
    response: response
  });
})

app.listen(3000);
