import { ChatGroq } from "@langchain/groq";

// Créer le modèle de base qui sera utilisé par tous les agents
export const baseGroqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});

// Exporte directement comme model pour simplifier l'import
export const model = baseGroqModel;
