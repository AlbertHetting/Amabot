import express from "express";
import fs from "node:fs/promises";
import messagesRouter from "./routes/messages.js";
import answersRouter from "./routes/answers.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/messages", messagesRouter);
app.use("/answers", answersRouter);

app.listen(port, () => {
  console.log(`server is running on http://localhost${port}`);
});

const topicStats = {
  navn: 0,
  bosted: 0,
  hobby: 0,
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

function findBestAnswer(question) {
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

console.log(countMatches(["navn", "hedder", "hvem er du"], "hvad hedder du?")); //1

console.log(
  countMatches(
    ["navn", "hedder", "hvem er du"],
    "hvad hedder du, og hvem er du?",
  ),
);
