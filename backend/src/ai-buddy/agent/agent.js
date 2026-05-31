import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';
import { ToolMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { env } from '../../config/env.js';
import * as tools from './tools.js';
import { SYSTEM_PROMPT } from '../prompts/shoppingAssistant.prompt.js';

// Use only Groq since OpenAI quota is exhausted.
// compound-beta has excellent tool calling support.
let model;
if (env.GROQ_API_KEY) {
  model = new ChatGroq({
    apiKey: env.GROQ_API_KEY,
    model: 'llama-3.1-8b-instant',
    temperature: 0.6,
  });
  console.log('🤖 AI Model: Groq llama-3.1-8b-instant');
} else if (env.OPENAI_API_KEY) {
  model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    apiKey: env.OPENAI_API_KEY,
  });
  console.log('🤖 AI Model: OpenAI gpt-4o-mini');
} else {
  console.error('❌ No AI API keys configured! Set GROQ_API_KEY or OPENAI_API_KEY in .env');
}

const availableTools = [
  tools.searchProduct, 
  tools.recommendProducts, 
  tools.getProductDetails, 
  tools.addProductToCart, 
  tools.removeProductFromCart,
  tools.scrollPage,
  tools.navigateToProduct,
  tools.navigateToPage
];

const graph = new StateGraph(MessagesAnnotation)
  .addNode('tools', async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const toolsCall = lastMessage.tool_calls || [];
    
    const toolCallResults = await Promise.all(
      toolsCall.map(async (call) => {
        const toolObj = availableTools.find(t => t.name === call.name);
        if (!toolObj) {
          console.error('Tool not found:', call.name);
          return new ToolMessage({
            content: JSON.stringify({ error: 'Tool not found: ' + call.name }),
            name: call.name,
            tool_call_id: call.id,
          });
        }
        console.log('🔧 Invoking tool:', call.name, JSON.stringify(call.args));
        
        try {
          const toolResult = await toolObj.invoke(call.args);
          return new ToolMessage({
            content: toolResult,
            name: call.name,
            tool_call_id: call.id,
          });
        } catch (e) {
          console.error('Tool execution error:', e.message);
          return new ToolMessage({
            content: JSON.stringify({ error: 'Tool execution failed: ' + e.message }),
            name: call.name,
            tool_call_id: call.id,
          });
        }
      })
    );
    
    return { messages: [...state.messages, ...toolCallResults] };
  })
  .addNode('chat', async (state) => {
    if (!model) {
      return {
        messages: [...state.messages, new AIMessage({
          content: 'AI model configured nahi hai. Admin se contact karo! 😅',
        })]
      };
    }

    try {
      // Build messages with system prompt at front
      const messages = [...state.messages];
      if (messages.length === 0 || messages[0]._getType() !== 'system') {
        messages.unshift(new SystemMessage(SYSTEM_PROMPT));
      }

      const response = await model.invoke(messages, {
        tools: availableTools,
      });

      return {
        messages: [...state.messages, new AIMessage({
          content: response.content || '', 
          tool_calls: response.tool_calls,
        })]
      };
    } catch (err) {
      console.error('❌ AI Error:', err.message);
      console.error('❌ Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      return {
        messages: [...state.messages, new AIMessage({
          content: 'Thoda issue aa gaya, ek minute mein try karna! 😅',
        })]
      };
    }
  })
  .addEdge('__start__', 'chat')
  .addConditionalEdges('chat', (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return 'tools';
    }
    return '__end__';
  })
  .addEdge('tools', 'chat');

export const shoppingAgent = graph.compile();
