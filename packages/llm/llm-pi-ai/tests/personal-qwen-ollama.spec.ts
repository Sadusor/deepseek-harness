import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import LlmRuntime, { ReasoningEffortId, createUserMessage } from '@deepseek-ai/dsh-llm'
import * as LlmPiAi from '@deepseek-ai/dsh-llm-pi-ai'
import { assemble } from './assemble.ts'
import { closeMockServers, mockServer, textEvents } from './mock-server.ts'

// PERSONAL-QWEN subsystem 1. Canonical decisions and status live ONLY in
// Sadusor/PERSONAL-QWEN-9B: AGENTS.md, ROADMAP.md and STATUS.md.
afterEach(async () => {
  vi.unstubAllEnvs()
  await closeMockServers()
})

describe('Personal Qwen / Ollama wire contract', () => {
  it('dispatches thinking OFF as explicit none and keeps Qwen model ID intact', async () => {
    vi.stubEnv('OLLAMA_LOCAL_API_KEY', 'ollama')
    const server = await mockServer([{ events: textEvents }])
    const ctx = new Context()
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(LlmPiAi, {
      providers: {
        'ollama-local': {
          api: 'openai-completions',
          baseURL: `${server.url}/v1`,
          apiKeyEnv: 'OLLAMA_LOCAL_API_KEY',
          models: [{
            id: 'qwen35-9b-orion:latest',
            contextWindow: 16384,
            maxTokens: 8192,
            reasoningEfforts: { off: 'none', high: 'high' },
          }],
        },
      },
    })
    const result = await assemble(ctx, {
      provider: 'ollama-local',
      model: 'qwen35-9b-orion:latest',
      reasoningEffort: ReasoningEffortId('off'),
      messages: [createUserMessage({ content: [{ type: 'text', text: 'Reply 123' }] })],
    })
    expect(result.finish).toEqual({ kind: 'stop' })
    expect(server.paths).toEqual(['/v1/chat/completions'])
    expect(server.requests[0]).toMatchObject({
      model: 'qwen35-9b-orion:latest',
      reasoning_effort: 'none',
    })
  })

  it('recognizes a provider length finish as max-tokens, not successful coding', async () => {
    vi.stubEnv('OLLAMA_LOCAL_API_KEY', 'ollama')
    const events = [
      '{"choices":[{"delta":{"role":"assistant","content":"partial"},"index":0,"finish_reason":null}]}',
      '{"choices":[{"delta":{},"index":0,"finish_reason":"length"}],"usage":{"prompt_tokens":6400,"completion_tokens":8192}}',
      '[DONE]',
    ]
    const server = await mockServer([{ events }])
    const ctx = new Context()
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(LlmPiAi, {
      providers: {
        'ollama-local': {
          api: 'openai-completions',
          baseURL: `${server.url}/v1`,
          apiKeyEnv: 'OLLAMA_LOCAL_API_KEY',
          models: [{ id: 'qwen35-9b-orion:latest', contextWindow: 16384, maxTokens: 8192 }],
        },
      },
    })
    const result = await assemble(ctx, {
      provider: 'ollama-local',
      model: 'qwen35-9b-orion:latest',
      messages: [createUserMessage({ content: [{ type: 'text', text: 'Test' }] })],
    })
    expect(result.finish).toEqual({ kind: 'max-tokens' })
  })
})
