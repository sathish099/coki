
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const { createOpenRouter } = require('@openrouter/ai-sdk-provider');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { history, newMessage } = req.body;

  try {
    const ai = getAI();
    const historyContents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    const chat = ai.chats.create({
      model: 'gemma2-27b-it',
      history: historyContents,
    });
    const responseStream = await chat.sendMessageStream({ message: newMessage });

    res.setHeader('Content-Type', 'text/plain');
    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();
  } catch (error) {
    console.error("Gemini API failed, falling back to OpenRouter:", error);
    try {
      const chatModel = openrouter.chat('google/gemma-3-27b-it:free');
      const responseStream = await chatModel.stream({
        messages: [
          ...history.map(m => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.text,
          })),
          { role: 'user', content: newMessage },
        ],
      });

      res.setHeader('Content-Type', 'text/plain');
      for await (const chunk of responseStream) {
        if (chunk.choices[0].delta.content) {
          res.write(chunk.choices[0].delta.content);
        }
      }
      res.end();
    } catch (fallbackError) {
      console.error("OpenRouter fallback failed:", fallbackError);
      res.status(500).send('An error occurred with the fallback AI service.');
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
