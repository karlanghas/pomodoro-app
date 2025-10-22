const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Initialize database
const db = new sqlite3.Database('./pomodoro.db');

// Create tasks table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Get all tasks
router.get('/', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY order_index', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(rows);
  });
});

// Create a new task
router.post('/', (req, res) => {
  const { title, description } = req.body;
  
  // Get the highest order_index to place the new task at the end
  db.get('SELECT MAX(order_index) as maxOrder FROM tasks', (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create task' });
    }
    
    const orderIndex = (row.maxOrder || 0) + 1;
    
    db.run(
      'INSERT INTO tasks (title, description, order_index) VALUES (?, ?, ?)',
      [title, description, orderIndex],
      function(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to create task' });
        }
        
        res.json({
          id: this.lastID,
          title,
          description,
          order_index: orderIndex
        });
      }
    );
  });
});

// Update a task
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  
  db.run(
    'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
    [title, description, id],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update task' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json({ success: true });
    }
  );
});

// Delete a task
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ success: true });
  });
});

// Reorder tasks
router.put('/reorder', (req, res) => {
  const { tasks } = req.body;
  
  // Begin transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    let hasError = false;
    
    tasks.forEach((task, index) => {
      db.run(
        'UPDATE tasks SET order_index = ? WHERE id = ?',
        [index + 1, task.id],
        function(err) {
          if (err) {
            console.error(err);
            hasError = true;
          }
        }
      );
    });
    
    if (hasError) {
      db.run('ROLLBACK');
      return res.status(500).json({ error: 'Failed to reorder tasks' });
    } else {
      db.run('COMMIT');
      return res.json({ success: true });
    }
  });
});

module.exports = router;