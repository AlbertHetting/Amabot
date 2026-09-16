import express from "express";
import fs from "node:fs/promises";

const app = express();
const port = 3000;

async function loadMessages() {
  const messages = await fs.readFile("./data/messages.json", "utf8");
  const messageHistory = JSON.parse(messages);

  return messageHistory;
}

async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);

  await fs.writeFile("./data/messages.json", json);
}

const answers = [
  {
    category: "navn",
    keywords: ["navn", "hedder", "hvem er du"],
    answer: "Jeg hedder Albert. Hvad vil du ellers vide om mig?",
  },
  {
    category: "bosted",
    keywords: ["bor", "by", "fra"],
    answer: "Jeg bor i Lystrup.",
  },
  {
    category: "hobby",
    keywords: ["fritid", "hobby", "kan lide"],
    answer: "I min fritid kan jeg godt lide at spille computer eller træne.",
  },
  {
    category: "Kæledyr",
    keywords: ["Hund", "Kæledyr", "Race", "Kattedyr"],
    answer: "Jeg har en hund der hedder nellie, hun er en Border Collie",
  },

  {
    category: "Kæledyr",
    keywords: ["Kat", "Skilpadde", "Kanin"],
    answer: "Jeg har ikke en kat skilpadde, eller kanin :(",
  },
];

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

console.log(
  findBestAnswer("Hvad hedder du, hvad er dit navn, og hvor bor du?"),
);

console.log(findBestAnswer("Kan du bage en kage?"));

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.get("/", async (request, response) => {
  const messages = await loadMessages();

  response.render("index", { messages, error: "", topicStats });
});

app.post("/ask", async (request, response) => {
  const question = request.body.question.trim();
  let error = "";

  const messages = await loadMessages();

  if (!question) {
    error = "skriv et spørgsmål!";
  } else {
    messages.push({ type: "question", text: question });
    const result = findBestAnswer(question);
    messages.push({ type: "answer", text: result.answer });
    if (result.category) {
      topicStats[result.category] = topicStats[result.category] + 1;
    }
  }

  await saveMessages(messages);

  response.render("index", { messages, error, topicStats });
});

app.listen(port, () => {
  console.log(`server is running on http://localhost${port}`);
});
