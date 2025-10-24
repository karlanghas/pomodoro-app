import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TaskManager = ({ user }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    fetch('/api/tasks', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => {
        console.error('Error fetching tasks:', err);
        setError('Error al cargar las tareas');
      });
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || ''
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: ''
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    setError('');
    
    if (editingTask) {
      // Update existing task
      fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al actualizar la tarea');
          return res.json();
        })
        .then(() => {
          fetchTasks();
          handleCloseDialog();
          setSuccess('Tarea actualizada correctamente');
          setTimeout(() => setSuccess(''), 3000);
        })
        .catch(err => {
          console.error('Error updating task:', err);
          setError('Error al actualizar la tarea');
        });
    } else {
      // Create new task
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al crear la tarea');
          return res.json();
        })
        .then(() => {
          fetchTasks();
          handleCloseDialog();
          setSuccess('Tarea creada correctamente');
          setTimeout(() => setSuccess(''), 3000);
        })
        .catch(err => {
          console.error('Error creating task:', err);
          setError('Error al crear la tarea');
        });
    }
  };

  const handleDelete = (taskId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al eliminar la tarea');
          return res.json();
        })
        .then(() => {
          fetchTasks();
          setSuccess('Tarea eliminada correctamente');
          setTimeout(() => setSuccess(''), 3000);
        })
        .catch(err => {
          console.error('Error deleting task:', err);
          setError('Error al eliminar la tarea');
        });
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);

    // Update order in backend
    fetch('/api/tasks/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: items }),
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al reordenar las tareas');
        return res.json();
      })
      .catch(err => {
        console.error('Error reordering tasks:', err);
        setError('Error al reordenar las tareas');
        fetchTasks(); // Revert to original order
      });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestión de Tareas
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Gestión de Tareas</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nueva Tarea
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <List
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ width: '100%' }}
              >
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          bgcolor: snapshot.isDragging ? 'grey.200' : 'transparent',
                          borderRadius: 1,
                          mb: 1,
                          border: '1px solid',
                          borderColor: 'grey.300'
                        }}
                        secondaryAction={
                          <Box>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleOpenDialog(task)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDelete(task.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={task.title}
                          secondary={task.description}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Título"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Descripción"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit}>{editingTask ? 'Actualizar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManager;