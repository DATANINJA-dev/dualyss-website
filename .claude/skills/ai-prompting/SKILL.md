---
name: ai-prompting
description: Provides knowledge about prompt engineering, LLM integration patterns, and best practices for building AI-powered features using Google AI Studio (Gemini). Use when implementing AI chat, story generation, or estimation features.
---

# AI Prompting & LLM Integration Skill

## Overview
This skill provides comprehensive knowledge about prompt engineering, LLM integration patterns, and best practices for building AI-powered features using Google AI Studio (Gemini).

---

## Google AI Studio Setup

### Installation
```bash
npm install @google/generative-ai
```

### Configuration
```typescript
// lib/ai/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const gemini = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

export const geminiPro = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
});
```

### Environment Variables
```bash
# .env.local
GOOGLE_AI_API_KEY=your-api-key-here
```

---

## Basic Usage

### Simple Generation
```typescript
import { gemini } from '@/lib/ai/gemini';

export async function generateText(prompt: string) {
  const result = await gemini.generateContent(prompt);
  return result.response.text();
}
```

### Streaming Response
```typescript
export async function generateStream(prompt: string) {
  const result = await gemini.generateContentStream(prompt);

  let fullText = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    // Can yield chunks for real-time UI updates
  }

  return fullText;
}
```

### Chat Conversation
```typescript
export async function chat(history: Array<{role: string, parts: string}>, message: string) {
  const chat = gemini.startChat({ history });
  const result = await chat.sendMessage(message);
  return result.response.text();
}
```

---

## Prompt Engineering Fundamentals

### Prompt Structure
```
[SYSTEM CONTEXT]
You are a {role} that {primary function}.

[TASK DEFINITION]
Your task is to {specific action}.

[INPUT FORMAT]
The user will provide:
- {input 1}
- {input 2}

[OUTPUT FORMAT]
Respond with:
{expected format/structure}

[CONSTRAINTS]
- {constraint 1}
- {constraint 2}

[EXAMPLES]
Input: {example input}
Output: {example output}
```

### Prompt Templates

#### User Story Generation
```typescript
const USER_STORY_PROMPT = `You are an experienced Product Manager assistant.

Your task is to analyze a requirement and generate a well-structured user story.

INPUT:
Requirement: {requirement}
Product Context: {productContext}

OUTPUT FORMAT (JSON):
{
  "title": "Short descriptive title",
  "description": "As a [persona], I want [goal], so that [benefit]",
  "acceptance_criteria": [
    "Given [context], When [action], Then [result]",
    ...
  ],
  "story_points": number (1,2,3,5,8,13),
  "priority": "must" | "should" | "could",
  "labels": ["label1", "label2"],
  "notes": "Additional context or considerations"
}

CONSTRAINTS:
- Use INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Generate 3-5 acceptance criteria in Gherkin format
- Story points should reflect complexity, not time
- Be specific and actionable

Generate the user story:`;
```

#### Estimation Prompt
```typescript
const ESTIMATION_PROMPT = `You are a technical estimation expert.

Analyze this user story and provide a story point estimate.

STORY:
Title: {title}
Description: {description}
Acceptance Criteria:
{acceptanceCriteria}

SIMILAR STORIES FOR REFERENCE:
{historicalStories}

FIBONACCI SCALE GUIDE:
1 = Trivial, few hours
2 = Simple, less than a day
3 = Small, 1-2 days
5 = Medium, 2-4 days
8 = Large, 1 week
13 = Extra large, consider splitting

OUTPUT FORMAT (JSON):
{
  "estimate": number,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explanation of estimate",
  "risks": ["potential risk 1", "potential risk 2"],
  "suggestions": "Any recommendations for the story"
}

Provide your estimation:`;
```

#### Sprint Goal Generation
```typescript
const SPRINT_GOAL_PROMPT = `You are a Scrum expert helping define sprint goals.

SPRINT CONTEXT:
Sprint Number: {sprintNumber}
Duration: {duration} days
Team Capacity: {capacity} story points

SELECTED STORIES:
{stories}

PRODUCT VISION:
{productVision}

Generate a clear, actionable sprint goal that:
1. Summarizes the sprint's main objective
2. Is measurable and achievable
3. Provides clear value to users
4. Aligns with product vision

OUTPUT FORMAT (JSON):
{
  "goal": "Sprint goal statement",
  "key_deliverables": ["deliverable 1", "deliverable 2"],
  "success_metrics": ["metric 1", "metric 2"],
  "risks": ["risk 1"]
}

Generate the sprint goal:`;
```

---

## Structured Output

### JSON Schema Validation
```typescript
import { z } from 'zod';

const UserStorySchema = z.object({
  title: z.string(),
  description: z.string(),
  acceptance_criteria: z.array(z.string()),
  story_points: z.number().int().min(1).max(21),
  priority: z.enum(['must', 'should', 'could']),
  labels: z.array(z.string()),
  notes: z.string().optional(),
});

export async function generateUserStory(requirement: string, context: string) {
  const prompt = USER_STORY_PROMPT
    .replace('{requirement}', requirement)
    .replace('{productContext}', context);

  const result = await gemini.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return UserStorySchema.parse(parsed);
}
```

### Forcing JSON Output
```typescript
const prompt = `${basePrompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just the JSON object.`;
```

---

## API Route Integration

### Streaming API Route
```typescript
// app/api/ai/analyze/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  const { requirement, productContext } = await request.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this requirement and generate a user story...
  Requirement: ${requirement}
  Context: ${productContext}`;

  const result = await model.generateContentStream(prompt);

  // Create readable stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
```

### Client-Side Streaming
```typescript
// hooks/useAIStream.ts
import { useState, useCallback } from 'react';

export function useAIStream() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(async (requirement: string) => {
    setIsLoading(true);
    setResponse('');

    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      setResponse(prev => prev + text);
    }

    setIsLoading(false);
  }, []);

  return { response, isLoading, generate };
}
```

---

## Context Management

### Building Context
```typescript
interface ProductContext {
  name: string;
  description: string;
  vision: string;
  personas: string[];
  currentSprint?: string;
  recentStories?: string[];
}

function buildContextPrompt(context: ProductContext): string {
  return `
PRODUCT CONTEXT:
Product: ${context.name}
Description: ${context.description}
Vision: ${context.vision}

TARGET USERS:
${context.personas.map(p => `- ${p}`).join('\n')}

${context.currentSprint ? `CURRENT SPRINT: ${context.currentSprint}` : ''}

${context.recentStories?.length ? `
RECENT STORIES FOR REFERENCE:
${context.recentStories.map(s => `- ${s}`).join('\n')}
` : ''}
`.trim();
}
```

### Conversation History
```typescript
interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

function formatHistory(messages: Array<{ role: string; content: string }>): Message[] {
  return messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

export async function continueConversation(
  history: Array<{ role: string; content: string }>,
  newMessage: string
) {
  const chat = gemini.startChat({
    history: formatHistory(history),
  });

  const result = await chat.sendMessage(newMessage);
  return result.response.text();
}
```

---

## Token Management

### Counting Tokens
```typescript
export async function countTokens(text: string) {
  const result = await gemini.countTokens(text);
  return result.totalTokens;
}
```

### Staying Within Limits
```typescript
const MAX_CONTEXT_TOKENS = 30000; // Leave room for response

export async function truncateContext(
  context: string,
  maxTokens: number = MAX_CONTEXT_TOKENS
): Promise<string> {
  const tokens = await countTokens(context);

  if (tokens <= maxTokens) {
    return context;
  }

  // Simple truncation - could be smarter
  const ratio = maxTokens / tokens;
  const targetLength = Math.floor(context.length * ratio * 0.9);

  return context.slice(0, targetLength) + '\n[Context truncated...]';
}
```

---

## Error Handling

### Retry Logic
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth errors
      if (error.message?.includes('API key')) {
        throw error;
      }

      // Exponential backoff
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }

  throw lastError!;
}

// Usage
const result = await withRetry(() =>
  gemini.generateContent(prompt)
);
```

### Graceful Degradation
```typescript
export async function generateWithFallback(prompt: string) {
  try {
    // Try primary model
    const result = await geminiPro.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.warn('Pro model failed, falling back to Flash');

    try {
      // Fallback to faster model
      const result = await gemini.generateContent(prompt);
      return result.response.text();
    } catch (fallbackError) {
      // Return a helpful error message
      return JSON.stringify({
        error: true,
        message: 'AI generation temporarily unavailable',
        suggestion: 'Please try again or create the story manually',
      });
    }
  }
}
```

---

## Prompt Patterns

### Few-Shot Learning
```typescript
const FEW_SHOT_PROMPT = `Generate acceptance criteria for user stories.

EXAMPLES:

Story: User can login with email and password
Criteria:
- Given I am on the login page, When I enter valid credentials and click Login, Then I am redirected to the dashboard
- Given I am on the login page, When I enter invalid password, Then I see an error message
- Given I am logged in, When I close and reopen the browser, Then I remain logged in

Story: User can reset their password
Criteria:
- Given I am on the login page, When I click "Forgot Password" and enter my email, Then I receive a reset email
- Given I have a reset link, When I click it and enter a new valid password, Then my password is updated
- Given I have a reset link older than 24 hours, When I click it, Then I see an expiration message

Now generate criteria for:
Story: ${userStory}
Criteria:`;
```

### Chain of Thought
```typescript
const COT_PROMPT = `Estimate this user story step by step.

Story: ${storyDescription}

Think through this systematically:

1. COMPLEXITY ANALYSIS
   - What technical components are involved?
   - What integrations are needed?
   - Are there any unknowns?

2. SCOPE ASSESSMENT
   - What's included in this story?
   - What's explicitly excluded?
   - Are there edge cases to handle?

3. COMPARISON
   - Similar stories in the past took X points
   - This story is simpler/similar/more complex because...

4. FINAL ESTIMATE
   Based on the above analysis, my estimate is X story points.

Provide your analysis:`;
```

### Self-Critique
```typescript
const SELF_CRITIQUE_PROMPT = `${initialPrompt}

After generating your response, review it:
- Does it meet all the requirements?
- Is anything missing or incorrect?
- Could it be clearer or more actionable?

If you find issues, fix them in your final response.`;
```

---

## Rate Limiting & Quotas

### Free Tier Limits (Google AI Studio)
- 15 requests per minute (RPM)
- 1 million tokens per day
- 1,500 requests per day

### Implementing Rate Limiting
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(15, '1 m'),
});

export async function rateLimitedGenerate(userId: string, prompt: string) {
  const { success, remaining } = await ratelimit.limit(userId);

  if (!success) {
    throw new Error(`Rate limit exceeded. Try again in a minute.`);
  }

  return gemini.generateContent(prompt);
}
```

---

## Best Practices

### Prompt Design
1. **Be specific** - Vague prompts get vague results
2. **Provide examples** - Show don't tell
3. **Define format** - Specify exact output structure
4. **Set constraints** - List what NOT to do
5. **Include context** - Product/domain knowledge

### Response Handling
1. **Validate output** - Use Zod schemas
2. **Handle errors** - Graceful degradation
3. **Stream when possible** - Better UX
4. **Cache responses** - Save tokens
5. **Log prompts** - Debug and improve

### Security
1. **Never expose API keys** - Server-side only
2. **Validate input** - Prevent injection
3. **Rate limit** - Prevent abuse
4. **Sanitize output** - XSS prevention
5. **Audit logs** - Track usage

---

## Quick Reference

### Model Selection
| Model | Use Case | Speed | Cost |
|-------|----------|-------|------|
| gemini-1.5-flash | Most tasks | Fast | Cheap |
| gemini-1.5-pro | Complex reasoning | Medium | Higher |

### Temperature Guide
| Value | Use Case |
|-------|----------|
| 0.0-0.3 | Factual, consistent |
| 0.4-0.7 | Balanced creativity |
| 0.8-1.0 | Creative, varied |

### Token Estimation
- ~4 characters = 1 token (English)
- 1 page text ≈ 500 tokens
- JSON overhead ≈ 20% more tokens
