// lib/agentRouter.ts
import { agents } from '@/lib/agents';
import { ChatCompletionRequestMessage } from 'openai';

export type AgentResponse = {
  content: string;
  agentName: string;
  toolUsed?: string;
};

export async function routeMessageToAgent(
  messages: ChatCompletionRequestMessage[],
  agentId: string
): Promise<AgentResponse> {
  const agent = agents[agentId];
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  const { content, toolUsed } = await agent.respond(messages);
  return {
    content,
    agentName: agentId,
    toolUsed,
  };
}
