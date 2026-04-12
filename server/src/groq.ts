import OpenAI from "openai";

function createGroqClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set — check your .env file");
  return new OpenAI({ apiKey: key, baseURL: "https://api.groq.com/openai/v1" });
}

export function getGroqClient() {
  return createGroqClient();
}
