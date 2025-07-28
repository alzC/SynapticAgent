import { tools } from "../tools"; // On garde l'import si tu l'utilises ailleurs
import { BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { model } from "../model";

// Template pour l'agent calculateur
const calculatorPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Tu es un expert en mathématiques qui doit utiliser l'outil calculator pour tous les calculs.

INSTRUCTIONS IMPORTANTES:
1. Utilise TOUJOURS l'outil calculator pour effectuer des calculs
2. Ne réponds JAMAIS directement, utilise toujours l'outil
3. Format correct pour appeler l'outil:

function: calculator
args: {{ "expression": "ton_calcul" }}

Par exemple, pour calculer 2 + 2:
function: calculator
args: {{ "expression": "2 + 2" }}

Explique d'abord ce que tu vas calculer, puis utilise l'outil.`,
  ],
  ["human", "{input}"],
  ["ai", "{agent_scratchpad}"],
]);
// Template pour l'agent météo
const weatherPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Tu es un expert en météorologie qui doit toujours utiliser l'outil 'weather' pour obtenir les informations météo.\n\n" +
    "- Pour chaque demande, tu DOIS utiliser l'outil 'weather'\n" +
    "- L'outil attend un nom de ville en paramètre\n" +
    "- Explique d'abord ce que tu vas chercher\n" +
    "- Ensuite, obtiens les informations avec l'outil\n" +
    "- Analyse et explique les conditions météorologiques",
  ],
  ["human", "{input}"],
  ["ai", "{agent_scratchpad}"],
]);

// Création de l'agent calculateur
export const createCalculatorAgent = async () => {
  // Configurer le modèle Groq avec les fonctions spécifiques
  const modelWithFunctions = model.bind({
    functions: [{
      name: "calculator",
      description: "Effectue des calculs mathématiques",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "L'expression mathématique à calculer (exemple: '2 + 2' ou '10 * 10')"
          }
        },
        required: ["expression"]
      }
    }],
    // Forcer l'utilisation de la fonction calculator
    function_call: { name: "calculator" }
  });

  const agent = await createOpenAIFunctionsAgent({
    llm: modelWithFunctions as any,
    tools: [tools.calculator],
    prompt: calculatorPrompt
  });

  return AgentExecutor.fromAgentAndTools({
    agent,
    tools: [tools.calculator],
    /* Options d'optimisation de tokens
    handleParsingErrors: true,
    returnIntermediateSteps: false,
    verbose: false,
    maxIterations: 1
    */
  });
};

// Création de l'agent météo inchangée
export const createWeatherAgent = async () => {
  const agent = await createOpenAIFunctionsAgent({
    llm: model as any,
    tools: [tools.weather],
    prompt: weatherPrompt,
  });

  return AgentExecutor.fromAgentAndTools({
    agent,
    tools: [tools.weather],
    /* Options d'optimisation de tokens
    handleParsingErrors: true,
    returnIntermediateSteps: false,
    verbose: false,
    maxIterations: 1
    */
  });
};

// Type pour l'état des agents
export type AgentState = {
  input: string;
  agent_scratchpad: BaseMessage[];
  agentName?: string;
};
