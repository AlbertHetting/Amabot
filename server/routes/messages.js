import express from "express";
import { loadMessages } from "../data/messages.js";
import { saveMessages } from "../data/messages.js";

const messagesRouter = express.Router();

messagesRouter.get("/", async (request, response) => {
  const messages = await loadMessages();

  response.json(messages);
});

messagesRouter.post("/", async (request, response) => {
  const messages = await loadMessages();
  const question = request.body.question.trim();

  if (!question) {
    console.log("Write a question!");
    response.json({ error: "skriv spørgsmål før du vælget at sende" });
    return;
  }

  const message = {
    type: "question",
    text: question,
    createdAt: new Date().toISOString(),
  };
  messages.push(message);

  result = findBestAnswer(question);
  answerMessage = {
    type: "answer",
    text: answer,
    createdAt: new Date().toISOString(),
  };
  messages.push(answerMessage);

  await saveMessages(messages);

  response.json({ question: message, answer: answerMessage });
});

messagesRouter.delete("/", async (request, response) => {
  await saveMessages([]);

  response.send();
});

export default messagesRouter;
