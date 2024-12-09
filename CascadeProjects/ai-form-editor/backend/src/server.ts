import express from 'express';
import payload from 'payload';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin');
});

// Initialize Payload
const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET as string,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  // Add your own express routes here
  app.post('/api/analyze-form', async (req, res) => {
    try {
      const { formId, data } = req.body;
      
      // Here you would implement your AI analysis logic
      // For example:
      // 1. Extract text from uploaded documents
      // 2. Process the text with AI models
      // 3. Generate suggestions and validations
      
      res.json({
        success: true,
        suggestions: [],
        confidence: 0,
      });
    } catch (error) {
      console.error('Error analyzing form:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze form',
      });
    }
  });

  app.listen(process.env.PORT || 3002);
};

start();
