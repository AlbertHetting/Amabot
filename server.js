import express from "express";

const app = express();
const port = 3000;

const messages = [];

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
];

const topicStats = {
  navn: 0,
  bosted: 0,
  hobby: 0,
};

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    normalizedQuestion.includes(keyword),
  );

  return matches.length;
}

function findBestAnswer(question) {
  const normalizedQuestion = question.toLowerCase();
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
app.get("/", (request, response) => {
  response.render("index", { messages, error: "", topicStats });
});

app.post("/ask", (request, response) => {
  const question = request.body.question.trim();
  let error = "";

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

  response.render("index", { messages, error, topicStats });
});

app.listen(port, () => {
  console.log(`server is running on http://localhost${port}`);
});
