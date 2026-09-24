import express from "express";
import { loadAnswers } from "../data/answers.js";
import { saveAnswers } from "../data/answers.js";

const answersRouter = express.Router();

answersRouter.get("/", async (request, response) => {
  const answers = await loadAnswers();

  response.json(answers);
});

answersRouter.get("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (a) => a.category === request.params.category,
  );

  response.json(answerRule);
});

answersRouter.post("/", async (request, response) => {
  const answers = await loadAnswers();
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

  answerRule.keywords = request.body.keywords;
  answerRule.answer = request.body.answer;
  await saveAnswers(answers);

  response.json(answerRule);
});

answersRouter.delete("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const updatedAnswers = answers.filter(
    (a) => a.category !== request.params.category,
  );

  await saveAnswers(updatedAnswers);

  response.send();
});

export default answersRouter;
