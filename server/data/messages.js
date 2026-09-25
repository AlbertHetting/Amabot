import fs from "node:fs/promises";

export async function loadMessages() {
  const messages = await fs.readFile("./server/data/messages.json", "utf8");
  const messageHistory = JSON.parse(messages);

  return messageHistory;
}

export async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);

  await fs.writeFile("./server/data/messages.json", json);
}
