import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { AgentState, createCalculatorAgent, createWeatherAgent } from "../agents";
import { AIMessage } from "@langchain/core/messages";
import { model as supervisorModel } from "../model";

const supervisorPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Tu es le superviseur qui décide quel agent spécialisé doit traiter une demande.

Les agents disponibles sont :
1. Agent Calculateur - Pour les calculs mathématiques
2. Agent Météo - Pour les informations météorologiques

Analyse la question et décide quel agent est le plus approprié.
Réponds uniquement avec "calculator" ou "weather".

Si la question ne correspond à aucun agent, explique pourquoi et réponds directement.`,
  ],
  ["human", "{input}"],
]);

const createSupervisorChain = () =>
  RunnableSequence.from([supervisorPrompt, supervisorModel]);

function isString(value: unknown): value is string {
  return typeof value === "string";
}

interface WorkflowResponse {
  agentName: string;
  response: string;
  toolUsed?: string;
}

export const runAgentWorkflow = async (input: string): Promise<WorkflowResponse> => {
  const supervisor = createSupervisorChain();
  const decision = await supervisor.invoke({ input });

  let agentType: string | undefined = undefined;
  let finalResponse = "";

  if (decision instanceof AIMessage && isString(decision.content)) {
    agentType = decision.content.trim().toLowerCase();
    finalResponse = decision.content.trim();
  } else if (isString(decision)) {
    agentType = decision.trim().toLowerCase();
    finalResponse = decision.trim();
  } else {
    return {
      agentName: "supervisor",
      response: "Réponse du superviseur non comprise.",
    };
  }

  if (agentType === "calculator") {
    const calculator = await createCalculatorAgent();
    const result = await calculator.call({ input });
    
    console.log("📊 Résultat brut de l'agent:", JSON.stringify(result, null, 2));
    
    // Si nous avons des étapes intermédiaires, on les utilise pour construire une réponse plus riche
    if (result.intermediateSteps) {
      const lastStep = result.intermediateSteps[result.intermediateSteps.length - 1];
      if (lastStep?.observation) {
        return {
          agentName: "calculator",
          response: `Le résultat du calcul est: ${lastStep.observation}`,
          toolUsed: "calculator",
        };
      }
    }

    // Fallback au cas où nous n'avons pas d'étapes intermédiaires
    return {
      agentName: "calculator",
      response: typeof result.output === "string" ? result.output : JSON.stringify(result.output),
      toolUsed: "calculator",
    };
  }

  if (agentType === "weather") {
    const weather = await createWeatherAgent();
    const result = await weather.invoke({ input });
    return {
      agentName: "weather",
      response: typeof result.output === "string" ? result.output : JSON.stringify(result.output),
      toolUsed: "weather",
    };
  }

  // Si aucun agent n'est approprié, on renvoie la réponse du superviseur
  return {
    agentName: "supervisor",
    response: finalResponse || "Je ne sais pas comment traiter cette demande.",
  };
};
