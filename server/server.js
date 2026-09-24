import express from "express";
import fs from "node:fs/promises";

const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(`server is running on http://localhost${port}`);
});

async function loadMessages() {
  const messages = await fs.readFile("./server/data/messages.json", "utf8");
  const messageHistory = JSON.parse(messages);

  return messageHistory;
}

async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);

  await fs.writeFile("./server/data/messages.json", json);
}

async function loadAnswers() {
  const data = await fs.readFile("./server/data/answers.json", "utf8");
  return JSON.parse(data);
}

async function saveAnswers(answers) {
  const json = JSON.stringify(answers, null, 2);

  await fs.writeFile("./server/data/answers.json", json);
}

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

app.get("/answers", async (request, response) => {
  const answers = await loadAnswers();

  response.json(answers);
});

app.get("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (a) => a.category === request.params.category,
  );

  response.json(answerRule);
});

app.get("/answers", async (request, response) => {
  const answers = await loadAnswers();

  response.json(answers);
});

app.post("/answers", async (request, response) => {
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

app.put("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (a) => a.category === request.params.category,
  );

  answerRule.keywords = request.body.keywords;
  answerRule.answer = request.body.answer;
  await saveAnswers(answers);

  response.json(answerRule);
});

app.delete("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const updatedAnswers = answers.filter(
    (a) => a.category !== request.params.category,
  );

  await saveAnswers(updatedAnswers);

  response.send();
});

app.post("/messages", async (request, response) => {
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

app.delete("/messages", async (request, response) => {
  await saveMessages([]);

  response.send();
});
