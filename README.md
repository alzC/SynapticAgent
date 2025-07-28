# 🧠 SynapticAgent

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Edge Runtime](https://img.shields.io/badge/Edge%20Runtime-Compatible-success)](https://vercel.com/docs/concepts/functions/edge-functions)

Un framework TypeScript moderne pour la création de systèmes multi-agents hiérarchisés, où les agents collaborent et s'adaptent comme des neurones dans un réseau neuronal.

## 🌟 Caractéristiques

- **🤖 Supervision Intelligente**

  - Routage automatique des requêtes vers les agents spécialisés
  - Gestion hiérarchique des tâches
  - Prise de décision contextuelle

- **🔧 Outils Modulaires**

  - Calculatrice sécurisée
  - Service météo simulé
  - Architecture extensible pour nouveaux outils

- **⚡ Performance**

  - Compatible Edge Runtime
  - Optimisation des tokens
  - Logs configurables

- **🔒 Sécurité**
  - Évaluation mathématique sécurisée
  - Validation des entrées
  - Gestion des erreurs robuste

## 🚀 Démarrage Rapide

1. **Installation**

```bash
git clone https://github.com/alzC/SynapticAgent.git
cd SynapticAgent
npm install
```

2. **Configuration**

```bash
cp .env.example .env.local
# Ajoutez votre clé API Groq dans .env.local
```

3. **Lancement**

```bash
npm run dev
```

## 🏗️ Architecture

```
src/
├── agents/       # Agents spécialisés
├── tools/        # Outils modulaires
├── supervisor/   # Système de supervision
├── components/   # Interface utilisateur
└── types/        # Définitions TypeScript
```

## 💻 Technologies

- **Frontend**: Next.js, React, TypeScript
- **IA**: LangChain, Groq
- **Runtime**: Edge Compatible
- **Style**: TailwindCSS

## 🛠️ API

### Endpoint Principal

```typescript
POST /api/chat
{
  "message": "Calcule 2 + 2"
}
```

### Réponse

```json
{
	"agentName": "calculator",
	"response": "Le résultat est 4",
	"toolUsed": "calculator"
}
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre [guide de contribution](CONTRIBUTING.md) pour commencer.

## 📈 Roadmap

- [ ] Ajout de nouveaux agents spécialisés
- [ ] Support pour des outils externes
- [ ] Interface d'administration
- [ ] Monitoring des performances
- [ ] Tests E2E

## 📄 Licence

[MIT](LICENSE) © [AlzC](https://github.com/alzC)

## ⭐ Support

Si vous trouvez ce projet utile, pensez à lui mettre une étoile sur GitHub !

---

Fait avec ❤️ et 🤖 en France
