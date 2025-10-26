const express = require('express');
const router = express.Router();

// Get boards from Wekan
router.post('/boards', async (req, res) => {
  try {
    const { wekanUrl, apiToken } = req.body;
    if (!wekanUrl || !apiToken) {
      return res.status(400).json({ error: 'Faltan la URL de Wekan o el token de API' });
    }

    const response = await fetch(`${wekanUrl}/api/boards`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al contactar la API de Wekan');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Wekan boards:', error);
    res.status(500).json({ error: 'Failed to fetch Wekan boards' });
  }
});

// Get cards from a specific board
router.post('/boards/:boardId/cards', async (req, res) => {
  try {
    const { wekanUrl, apiToken } = req.body;
    const { boardId } = req.params;

    if (!wekanUrl || !apiToken) {
      return res.status(400).json({ error: 'Faltan la URL de Wekan o el token de API' });
    }

    const response = await fetch(`${wekanUrl}/api/boards/${boardId}/cards`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al contactar la API de Wekan');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Wekan cards:', error);
    res.status(500).json({ error: 'Failed to fetch Wekan cards' });
  }
});

module.exports = router;