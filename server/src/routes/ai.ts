import { Router } from 'express';
import {
  generateFlowFromDescription,
  updateFlowWithAnswer,
  clearAllConversations,
  ConversationMessage,
} from '../services/aiService';

const router = Router();

router.get('/workflows', (req, res) => {
  // Return available workflow templates
  const workflows = [
    {
      id: 'text-analysis',
      name: 'Text Analysis',
      description: 'Analyze and process text content',
      parameters: ['text', 'analysis_type'],
    },
    {
      id: 'code-generation',
      name: 'Code Generation',
      description: 'Generate code based on requirements',
      parameters: ['requirements', 'language', 'framework'],
    },
    {
      id: 'data-processing',
      name: 'Data Processing',
      description: 'Process and transform data',
      parameters: ['data', 'transformation_type'],
    },
  ];

  res.json({ workflows });
});

// New conversation endpoints for data flow
router.post('/conversation/start', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await generateFlowFromDescription(
      description,
      conversationId
    );
    res.json({ success: true, conversationId, data: result });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

router.post('/conversation/continue', async (req, res) => {
  try {
    const { conversationId, answer } = req.body;

    if (!conversationId || !answer) {
      return res
        .status(400)
        .json({ error: 'Conversation ID and answer are required' });
    }

    const result = await updateFlowWithAnswer(conversationId, answer);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error continuing conversation:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Manual conversation cleanup endpoint
router.post('/conversations/clear', async (req, res) => {
  try {
    clearAllConversations();
    res.json({ success: true, message: 'All conversations cleared' });
  } catch (error) {
    console.error('Error clearing conversations:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export { router as aiRoutes };
