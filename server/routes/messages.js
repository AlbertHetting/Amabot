import express from "express";
import { loadMessages } from "../data/messages.js";
import { saveMessages } from "../data/messages.js";
import { findBestAnswer } from "../server.js";

const messagesRouter = express.Router();

messagesRouter.get("/", async (request, response) => {
  try {
    const messages = await loadMessages();
    response.json(messages);
  } catch {
    return response
      .status(500)
      .json({ error: "Unable to load any messages from server" });
  }
});

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

messagesRouter.post("/", async (request, response) => {
  const messages = await loadMessages();
  const question = request.body.question.trim();

  if (!question) {
    console.log("Write a question!");
    response.json({ error: "skriv spørgsmål før du vælger at sende" });
    return;
  }

  const message = {
    type: "question",
    text: escapeHtml(question),
    createdAt: new Date().toISOString(),
  };
  messages.push(message);

  const result = await findBestAnswer(question);
  const answerMessage = {
    type: "answer",
    text: escapeHtml(result.answer),
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
