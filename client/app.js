console.log("app.js er forbundet");

const API_URL = "http://localhost:3000";

const messagesContainer = document.querySelector(".TextChat");
const questionForm = document.querySelector(".Submitter");
const questionInput = document.querySelector("#question");
const clearMessagesButton = document.querySelector("#RemoverButton");

console.log(
  messagesContainer,
  questionForm,
  questionInput,
  clearMessagesButton,
);

async function getMessages() {
  const response = await fetch(`${API_URL}/messages`);
  const messages = await response.json();

  for (const message of messages) {
    displayMessage(message);
  }
}

getMessages();

questionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();

  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const data = await response.json();

  displayMessage(data.question);
  displayMessage(data.answer);

  questionInput.value = "";
});

clearMessagesButton.addEventListener("click", async () => {
  await fetch(`${API_URL}/messages`, { method: "DELETE" });
  messagesContainer.innerHTML = "";
});

function displayMessage(message) {
  let imageHtml = "";
  if (message.image) {
    imageHtml = `<img src="${message.image}" alt="Bot billede" class="ExtraImage"/>`;
  }

  const html = /*html*/ `
    <article class="${message.type}">
      <p>${message.text}</p>
    </article>
    ${imageHtml}`;

  messagesContainer.insertAdjacentHTML("beforeend", html);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
