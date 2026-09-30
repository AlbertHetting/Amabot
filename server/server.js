import express from "express";
import messagesRouter from "./routes/messages.js";
import answersRouter from "./routes/answers.js";
import cors from "cors";
import { loadAnswers } from "./data/answers.js";

const app = express();
const port = 3000;

app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());
app.use("/messages", messagesRouter);
app.use("/answers", answersRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Ukendt sti" });
});

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).json({ error: "intern serverfejl" });
});

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});

const topicStats = {
  navn: 0,
  bosted: 0,
  hobby: 0,
  kæledyr: 0,
  about: 0,
};

function macthesKeyword(question, keyword) {
  const searchPattern = new RegExp(`\\b${keyword}\\b`, "i");

  if (question.match(searchPattern) !== null) {
    return true;
  } else {
    return false;
  }
}

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    macthesKeyword(normalizedQuestion, keyword),
  );

  return matches.length;
}

function questionTrimming(question) {
  return question.trim().replace(/\s+/g, " ");
}

export async function findBestAnswer(question) {
  const answers = await loadAnswers();

  const cleanedQuestion = questionTrimming(question);

  const normalizedQuestion = cleanedQuestion.toLowerCase();

  let bestScore = 0;
  let bestCategory = "";
  let bestAnswer = "Det kan jeg ikke svare på endnu :(";

  for (const answerGroup of answers) {
    const currentScore = countMatches(answerGroup.keywords, normalizedQuestion);

    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestAnswer = answerGroup.answer;
      bestCategory = answerGroup.category;
    }
  }

  if (bestCategory) {
    topicStats[bestCategory]++;
    console.log(topicStats);
  }

  return {
    answer: bestAnswer,
    category: bestCategory,
  };
}
