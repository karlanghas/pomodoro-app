const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get boards from Wekan
router.get('/boards', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.WEKAN_URL}/api/boards`, {
      headers: {
        'Authorization': `Bearer ${process.env.WEKAN_API_TOKEN}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Wekan boards:', error);
    res.status(500).json({ error: 'Failed to fetch Wekan boards' });
  }
});

// Get cards from a specific board
router.get('/boards/:boardId/cards', async (req, res) => {
  try {
    const { boardId } = req.params;
    const response = await axios.get(`${process.env.WEKAN_URL}/api/boards/${boardId}/cards`, {
      headers: {
        'Authorization': `Bearer ${process.env.WEKAN_API_TOKEN}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Wekan cards:', error);
    res.status(500).json({ error: 'Failed to fetch Wekan cards' });
  }
});

// Update a card in Wekan
router.put('/cards/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const cardData = req.body;
    
    const response = await axios.put(`${process.env.WEKAN_URL}/api/cards/${cardId}`, cardData, {
      headers: {
        'Authorization': `Bearer ${process.env.WEKAN_API_TOKEN}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error updating Wekan card:', error);
    res.status(500).json({ error: 'Failed to update Wekan card' });
  }
});

module.exports = router;