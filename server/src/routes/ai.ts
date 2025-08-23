import { Router } from 'express';
import { clearAllConversations } from '../services/aiService';

const router = Router();

router.get('/workflows', (req, res) => {
  // Return available workflow templates
  const workflows = [
    {
      id: 'shopify-to-snowflake',
      name: 'Shopify to Snowflake',
      description: 'Connect Shopify data to Snowflake data warehouse',
      parameters: [
        'shopify_store_url',
        'shopify_api_key',
        'snowflake_account',
        'snowflake_username',
      ],
    },
    {
      id: 'api-to-database',
      name: 'API to Database',
      description: 'Extract data from API and load into database',
      parameters: ['api_endpoint', 'api_key', 'database_url', 'table_name'],
    },
    {
      id: 'file-to-warehouse',
      name: 'File to Data Warehouse',
      description: 'Process files and load into data warehouse',
      parameters: ['file_path', 'file_format', 'warehouse_url', 'target_table'],
    },
  ];

  res.json({ workflows });
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
