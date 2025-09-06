const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Receive articles from Make.com automation
app.post('/api/articles', async (req, res) => {
  try {
    const {
      client_id,
      headline,
      summary,
      key_takeaway,
      tldr,
      title,
      category,
      url,
      image_prompt
    } = req.body;

    const { data, error } = await supabase
      .from('articles')
      .insert([{
        client_id,
        headline,
        summary,
        key_takeaway,
        tldr,
        title,
        category,
        url,
        image_prompt,
        created_time: new Date().toISOString(),
        is_selected: false
      }])
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save article' });
    }

    console.log(`Article saved for client ${client_id}:`, headline);
    res.status(201).json({ 
      success: true, 
      message: 'Article saved successfully',
      article: data[0]
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get articles for client dashboard
app.get('/api/articles/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('client_id', client_id)
      .order('created_time', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }

    res.json({ 
      success: true, 
      articles: data,
      client_id 
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Newsletter API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
