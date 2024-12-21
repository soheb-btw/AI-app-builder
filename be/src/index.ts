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

  // const response = await anthropic.messages.create({
  //     messages: [{
  //         role: 'user', content: prompt
  //     }],
  //     model: 'claude-3-5-sonnet-20241022',
  //     max_tokens: 200,
  //     system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
  // })


  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra`,
  });

  console.log('prompt', prompt);
  // console.log('chat````````````````', JSON.stringify(chat.params?.history));
  let result = await model.generateContent(prompt);
  console.log(result.response.text());
  // const chat = model.startChat({
  //   history: [
  //     {
  //       role: "user",
  //       parts: [{ text: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra" }],
  //     },
  //     {
  //         role: "model",
  //         parts: [{ text: "Sure I will return only a single word."}]
  //     }
  //   ],
  // });

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
      prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompts: [nodeBasePrompt]
    })
    return;
  }

  res.status(403).json({ message: answer })
  return;

})

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;
  console.log('messagesss', messages);
  console.log('------------------------------' );

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: getSystemPrompt(),
  });
  let result = await model.generateContent(JSON.stringify(messages));
  console.log(result.response.text());
  console.log('enddinggggggg');
  const response = result.response.text(); // react or node
  res.json({
    response: response
  });
})

app.listen(3000);

async function run() {
  console.log(process.env.GEMINI_API_KEY);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
      {
        role: "user",
        parts: [{ text: 'I have 2 dogs in my house.' }]
      },
      {
        role: "model",
        parts: [{ text: 'Thats lovely!  What breeds are they?  Do they get along well?  Anything exciting happening in your canine household today?' }]
      }
    ],
  });
  let result = await chat.sendMessage("I have 2 dogs in my house.");
  console.log(result.response.text());
  
}

// run();

