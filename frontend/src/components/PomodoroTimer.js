import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon, 
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const PomodoroTimer = ({ user }) => {
  const [session, setSession] = useState({
    isActive: false,
    isBreak: false,
    timeRemaining: 25 * 60, // 25 minutes in seconds
    currentTask: null
  });
  const [tasks, setTasks] = useState([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Fetch current session
    fetch('/api/pomodoro/session', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(err => console.error('Error fetching session:', err));

    // Fetch tasks
    fetch('/api/tasks', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error('Error fetching tasks:', err));

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (session.isActive) {
      intervalRef.current = setInterval(() => {
        setSession(prevSession => {
          if (prevSession.timeRemaining <= 1) {
            // Timer finished
            clearInterval(intervalRef.current);
            
            // If it was a work session, start a break
            if (!prevSession.isBreak) {
              return {
                ...prevSession,
                isActive: true,
                isBreak: true,
                timeRemaining: 5 * 60 // 5 minutes break
              };
            } else {
              // Break finished, stop the timer
              return {
                ...prevSession,
                isActive: false,
                isBreak: false,
                timeRemaining: 25 * 60 // Reset to 25 minutes
              };
            }
          }
          
          return {
            ...prevSession,
            timeRemaining: prevSession.timeRemaining - 1
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session.isActive]);

  const handleStart = () => {
    const isBreak = session.isBreak;
    const timeRemaining = isBreak ? 5 * 60 : 25 * 60;
    
    fetch('/api/pomodoro/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: session.currentTask,
        isBreak
      }),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setSession(data.session);
      })
      .catch(err => console.error('Error starting session:', err));
  };

  const handlePause = () => {
    fetch('/api/pomodoro/pause', {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setSession(data.session);
      })
      .catch(err => console.error('Error pausing session:', err));
  };

  const handleReset = () => {
    fetch('/api/pomodoro/reset', {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setSession(data.session);
      })
      .catch(err => console.error('Error resetting session:', err));
  };

  const handleSelectTask = (taskId) => {
    setSession(prevSession => ({
      ...prevSession,
      currentTask: taskId
    }));
    setTaskDialogOpen(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTask = () => {
    if (!session.currentTask) return null;
    return tasks.find(task => task.id === session.currentTask);
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
      .then(res => res.json())
      .catch(err => console.error('Error reordering tasks:', err));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500, mb: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {session.isBreak ? 'Descanso' : 'Tiempo de Concentración'}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={200}
              thickness={2}
              sx={{ color: 'grey.200' }}
            />
            <CircularProgress
              variant="determinate"
              value={session.isBreak 
                ? 100 - (session.timeRemaining / (5 * 60) * 100)
                : 100 - (session.timeRemaining / (25 * 60) * 100)
              }
              size={200}
              thickness={2}
              sx={{ 
                color: session.isBreak ? 'secondary.main' : 'primary.main',
                position: 'absolute',
                left: 0,
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h3">
                {formatTime(session.timeRemaining)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {getCurrentTask() && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6">Tarea actual:</Typography>
            <Typography variant="body1">{getCurrentTask().title}</Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {!session.isActive ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayIcon />}
              onClick={handleStart}
            >
              Iniciar
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PauseIcon />}
              onClick={handlePause}
            >
              Pausar
            </Button>
          )}
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            Reiniciar
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<TaskIcon />}
            onClick={() => setTaskDialogOpen(true)}
          >
            Seleccionar Tarea
          </Button>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 800 }}>
        <Typography variant="h5" gutterBottom>
          Mis Tareas
        </Typography>
        
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
                          border: session.currentTask === task.id ? '2px solid' : 'none',
                          borderColor: 'primary.main'
                        }}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="select"
                            onClick={() => handleSelectTask(task.id)}
                          >
                            <TimerIcon />
                          </IconButton>
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
      
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)}>
        <DialogTitle>Seleccionar Tarea</DialogTitle>
        <DialogContent>
          <List>
            {tasks.map(task => (
              <ListItem 
                button 
                key={task.id} 
                onClick={() => handleSelectTask(task.id)}
                selected={session.currentTask === task.id}
              >
                <ListItemText primary={task.title} secondary={task.description} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PomodoroTimer;