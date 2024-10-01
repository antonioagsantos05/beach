require('dotenv').config(); // Carregar variáveis de ambiente
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const usuariosRoutes = require('./routes/user');
const jogadoresRoutes = require('./routes/controlPlayers');
const partidasRoutes = require('./routes/controlPartida');
const gamesRoutes = require('./routes/setsAndGames');

const app = express();

// Middleware para analisar o JSON
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://127.0.0.1:3000', // Permitir requisições do front-end
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Usar as rotas definidas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/jogadores', jogadoresRoutes);
app.use('/api/partidas', partidasRoutes);
app.use('/api/games', gamesRoutes);

// Iniciando o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
