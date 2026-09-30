import express from "express";
import { loadAnswers } from "../data/answers.js";
import { saveAnswers } from "../data/answers.js";
import { error } from "node:console";

const answersRouter = express.Router();

answersRouter.get("/", async (request, response) => {
  try {
    const answers = await loadAnswers();
    response.json(answers);
  } catch {
    return response
      .status(500)
      .json({ error: "Unable to load any answers from history" });
  }
});

answersRouter.get("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (a) => a.category === request.params.category,
  );

  if (!answerRule) {
    return response.status(404).json({ error: "kategorien kan ikke findes " });
  }

  response.json(answerRule);
});

answersRouter.post("/", async (request, response) => {
  const answers = await loadAnswers();

  if (!request.body.answer) {
    return response.status(500)({ error: "unable to retrieve details" });
  }

  const newAnswerRule = {
    category: request.body.category,
    keywords: request.body.keywords,
    answer: request.body.answer,
  };

  answers.push(newAnswerRule);
  await saveAnswers(answers);

  response.json(newAnswerRule);
});

answersRouter.put("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (a) => a.category === request.params.category,
  );

  if (!answerRule) {
    return response.status(400).json({ error: "unable to find best answer" });
  }

  answerRule.keywords = request.body.keywords;
  answerRule.answer = request.body.answer;
  await saveAnswers(answers);

  response.json(answerRule);
});

answersRouter.delete("/:category", async (request, response) => {
  const answers = await loadAnswers();

  const answerRule = answers.find(
    (a) => a.category === request.params.category,
  );

  if (!answerRule) {
    return response.status(400).json({ error: "kategorien kan ikke findes" });
  }

  const updatedAnswers = answers.filter(
    (a) => a.category !== request.params.category,
  );

  await saveAnswers(updatedAnswers);

  response.status(204).send();
});

export default answersRouter;
