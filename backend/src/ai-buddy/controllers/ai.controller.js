import { shoppingAgent } from '../agent/agent.js';
import { getConversationMemory, saveConversationMemory } from '../memory/conversationMemory.js';
import { HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';

/**
 * Rehydrate simple JS objects back into LangChain message classes
 */
function rehydrateMessages(rawMessages) {
  return rawMessages.map(msg => {
    const props = msg.data || msg.kwargs || msg;
    const type = msg.type || props.type;
    
    // Force content to be a string
    let safeContent = props.content;
    if (Array.isArray(safeContent) && safeContent.length > 0 && safeContent[0].type === 'text') {
       safeContent = safeContent[0].text;
    }
    if (typeof safeContent !== 'string') {
       safeContent = JSON.stringify(safeContent || '');
    }
    
    switch(type) {
      case 'human': 
        return new HumanMessage({ content: safeContent, name: props.name });
      case 'ai': 
        return new AIMessage({ content: safeContent, tool_calls: props.tool_calls || [] });
      case 'tool': 
        return new ToolMessage({ content: safeContent, tool_call_id: props.tool_call_id, name: props.name });
      default: 
        return null;
    }
  }).filter(Boolean);
}

export const chatWithAi = async (req, res) => {
  try {
    const { message, userId = 'guest', userName = 'Guest', conversationId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Fetch memory
    const rawMemory = await getConversationMemory(userId, conversationId);
    const messages = rehydrateMessages(rawMemory);

    // 2. Append user's message with name context
    const userPrefix = userName !== 'Guest' ? `[User Name: ${userName}] ` : '';
    messages.push(new HumanMessage({ content: `${userPrefix}${message}` }));

    // 3. Invoke agent
    const agentResponse = await shoppingAgent.invoke({ messages });
    const finalMessages = agentResponse.messages;
    const aiMessage = finalMessages[finalMessages.length - 1];

    // 4. Save updated memory (convert instances back to raw object state for serialization)
    const serializedForStorage = finalMessages.map(m => m.toDict());
    await saveConversationMemory(userId, conversationId, serializedForStorage);

    // 5. Parse tool outputs to determine UI actions
    let action = 'NONE';
    let products = null;
    let cartUpdate = null;
    let uiAction = null; // For scroll, navigation, etc.

    // Scan the final sequence of messages for tool calls that just completed
    for (let i = finalMessages.length - 2; i >= 0; i--) {
      const msg = finalMessages[i];
      if (msg._getType() === 'tool') {
        try {
          const parsedContent = JSON.parse(msg.content);
          
          if (msg.name === 'searchProduct' || msg.name === 'recommendProducts') {
            action = 'SHOW_PRODUCTS';
            products = parsedContent.products || parsedContent.similarProducts || parsedContent.coupleMatches || [];
            break;
          }
          
          if (msg.name === 'addProductToCart') {
            action = 'CART_ADDED';
            cartUpdate = parsedContent.item;
            break;
          }
          
          if (msg.name === 'removeProductFromCart') {
            action = 'CART_REMOVED';
            cartUpdate = parsedContent.cartItemId;
            break;
          }

          if (msg.name === 'scrollPage') {
            action = 'SCROLL';
            uiAction = { type: 'SCROLL', direction: parsedContent.direction, amount: parsedContent.amount };
            break;
          }

          if (msg.name === 'navigateToProduct') {
            action = 'NAVIGATE_PRODUCT';
            uiAction = { type: 'NAVIGATE_PRODUCT', slug: parsedContent.slug };
            break;
          }

          if (msg.name === 'navigateToPage') {
            action = 'NAVIGATE_PAGE';
            uiAction = { type: 'NAVIGATE_PAGE', page: parsedContent.page };
            break;
          }
        } catch (e) {
          // not JSON, ignore
        }
      } else if (msg._getType() === 'human') {
        break; // don't look past the current interaction turn
      }
    }

    console.log('📦 Response:', { action, productsCount: products?.length || 0, uiAction });

    return res.status(200).json({
      reply: aiMessage.content,
      action,
      products,
      cartUpdate,
      uiAction,
      audioText: aiMessage.content
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const resetConversation = async (req, res) => {
  try {
    const { userId = 'guest', conversationId = 'default' } = req.body;
    await saveConversationMemory(userId, conversationId, []);
    return res.status(200).json({ status: 'ok', message: 'Conversation reset' });
  } catch (error) {
    console.error('Reset Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
