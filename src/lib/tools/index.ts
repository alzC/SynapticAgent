import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const calculatorTool = new DynamicStructuredTool({
  name: "calculator",
  description: "Un outil pour effectuer des calculs mathématiques. Fournir l'expression à calculer.",
  schema: z.object({
    expression: z.string().describe("L'expression mathématique à calculer (exemple: '2 + 2' ou '10 * 10')")
  }),
  func: async ({ expression }) => {
    try {
      // Nettoie l'entrée pour ne garder que les caractères autorisés
      const sanitizedInput = expression.replace(/[^0-9+\-*/.()\s]/g, '');
      
      // Sépare l'expression en tokens
      const tokens = sanitizedInput.match(/(\d+\.?\d*|\+|\-|\*|\/|\(|\))/g);
      if (!tokens) throw new Error("Expression invalide");

      // Vérifie la validité des opérateurs
      const validOperators = new Set(['+', '-', '*', '/']);
      let lastWasOperator = true; // Pour gérer le premier nombre
      let parenCount = 0;

      for (const token of tokens) {
        if (validOperators.has(token)) {
          if (lastWasOperator) throw new Error("Opérateurs consécutifs");
          lastWasOperator = true;
        } else if (token === '(') {
          parenCount++;
          lastWasOperator = true;
        } else if (token === ')') {
          parenCount--;
          if (parenCount < 0) throw new Error("Parenthèses mal équilibrées");
          lastWasOperator = false;
        } else {
          // C'est un nombre
          if (!lastWasOperator && tokens[tokens.length - 1] !== ')') {
            throw new Error("Nombres consécutifs");
          }
          lastWasOperator = false;
        }
      }

      if (parenCount !== 0) throw new Error("Parenthèses mal équilibrées");
      if (lastWasOperator) throw new Error("Expression se termine par un opérateur");

      // Calcule l'expression de manière sûre
      const calculate = (tokens: string[]): number => {
        const precedence = {
          '+': 1,
          '-': 1,
          '*': 2,
          '/': 2
        };

        const applyOp = (op: string, b: number, a: number): number => {
          switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': 
              if (b === 0) throw new Error("Division par zéro");
              return a / b;
            default: throw new Error("Opérateur invalide");
          }
        };

        const values: number[] = [];
        const ops: string[] = [];

        tokens.forEach(token => {
          if (token === '(') {
            ops.push(token);
          }
          else if (token === ')') {
            while (ops.length && ops[ops.length - 1] !== '(') {
              const op = ops.pop()!;
              const b = values.pop()!;
              const a = values.pop()!;
              values.push(applyOp(op, b, a));
            }
            ops.pop(); // Remove '('
          }
          else if (validOperators.has(token)) {
            while (ops.length && ops[ops.length - 1] !== '(' && 
                   precedence[ops[ops.length - 1] as keyof typeof precedence] >= precedence[token as keyof typeof precedence]) {
              const op = ops.pop()!;
              const b = values.pop()!;
              const a = values.pop()!;
              values.push(applyOp(op, b, a));
            }
            ops.push(token);
          }
          else {
            values.push(Number(token));
          }
        });

        while (ops.length) {
          const op = ops.pop()!;
          const b = values.pop()!;
          const a = values.pop()!;
          values.push(applyOp(op, b, a));
        }

        return values[0];
      };

      const result = calculate(tokens);
      return result.toString();
    } catch (error) {
      return `Erreur lors du calcul: ${error instanceof Error ? error.message : 'erreur inconnue'}`;
    }
  }
});

const weatherTool = new DynamicStructuredTool({
  name: "weather",
  description: "Obtient la météo pour une ville donnée",
  schema: z.object({
    city: z.string().describe("Le nom de la ville")
  }),
  func: async ({ city }) => {
    // Simulation de réponse météo
    const cities = {
      "Paris": "20°C, Ensoleillé",
      "Lyon": "22°C, Nuageux",
      "Marseille": "25°C, Clair"
    };
    
    return cities[city as keyof typeof cities] || "Ville non trouvée";
  }
});

// Crée les instances des tools
export const tools = {
  calculator: calculatorTool,
  weather: weatherTool
} as const;

// Type pour les tools disponibles
export type ToolNames = keyof typeof tools;
