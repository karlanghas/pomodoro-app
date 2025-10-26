import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, ExpandMore as ExpandMoreIcon, Dashboard as DashboardIcon, Sync as SyncIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../services/api'; // Usaremos el helper de API

const WekanIntegration = ({ user }) => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  
  // Estado para la configuración, leída de localStorage
  const [config, setConfig] = useState({
    wekanUrl: localStorage.getItem('wekanUrl') || '',
    apiToken: localStorage.getItem('wekanApiToken') || '',
  });

  useEffect(() => {
    // Solo sincronizar si hay configuración guardada
    if (config.wekanUrl && config.apiToken) {
      fetchBoards();
    }
  }, []);

  const fetchBoards = async () => {
    if (!config.wekanUrl || !config.apiToken) {
      setError('Por favor, configura la URL y el token de API de Wekan.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // La petición ahora incluye la configuración en el cuerpo
      const data = await apiRequest('/wekan/boards', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      setBoards(data);
    } catch (err) {
      console.error('Error fetching Wekan boards:', err);
      setError('Error al obtener tableros de Wekan. Verifica la configuración.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveConfig = () => {
    // Guardar en localStorage
    localStorage.setItem('wekanUrl', config.wekanUrl);
    localStorage.setItem('wekanApiToken', config.apiToken);
    setOpenDialog(false);
    // Sincronizar automáticamente después de guardar
    fetchBoards();
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleBoardExpand = (boardId) => {
    if (!cards[boardId]) {
      fetchCards(boardId);
    }
  };

  const fetchCards = async (boardId) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiRequest(`/wekan/boards/${boardId}/cards`, {
        method: 'POST',
        body: JSON.stringify(config)
      });
      setCards(prev => ({ ...prev, [boardId]: data }));
    } catch (err) {
      console.error('Error fetching Wekan cards:', err);
      setError('Error al obtener tarjetas de Wekan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Integración con Wekan
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Integración con Wekan</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={fetchBoards}
              sx={{ mr: 2 }}
            >
              Sincronizar
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpenDialog}
            >
              Configurar Wekan
            </Button>
          </Box>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {boards.length === 0 ? (
              <Alert severity="info">
                No se encontraron tableros en Wekan. Asegúrate de haber configurado correctamente la URL y el token de API.
              </Alert>
            ) : (
              <Box>
                {boards.map(board => (
                  <ListItem key={board._id} sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1, mb: 1, p: 2 }}>
                    <ListItemText
                      primary={board.title}
                    />
                  </ListItem>
                ))}
              </Box>
            )}
          </>
        )}
      </Paper>
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Configurar Wekan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="wekanUrl"
            name="wekanUrl"
            label="URL de Wekan"
            type="url"
            fullWidth
            variant="outlined"
            value={config.wekanUrl}
            onChange={handleConfigChange}
            helperText="Ej: https://wekan.example.com"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="apiToken"
            name="apiToken"
            label="Token de API"
            type="text"
            fullWidth
            variant="outlined"
            value={config.apiToken}
            onChange={handleConfigChange}
            helperText="Token de API de Wekan para autenticación"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveConfig}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WekanIntegration;