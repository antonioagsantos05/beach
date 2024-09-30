const express = require('express');
const router = express.Router();
const db = require('../db'); // Certifique-se de que o caminho está correto

// Endpoint para criar uma nova partida (POST)
router.post('/', async (req, res) => {
    console.log('Recebendo requisição para criar partida:', req.body);
    
    try {
        // Verifique se todos os dados necessários estão no corpo da requisição
        if (!req.body.nome_partida || !req.body.data_partida || !req.body.dupla1_jogador1_id) {
            console.log('Dados faltando:', req.body);
            return res.status(400).json({ message: 'Dados incompletos.' });
        }

        const novaPartida = {
            nome_partida: req.body.nome_partida,
            data_partida: req.body.data_partida,
            dupla1_jogador1_id: req.body.dupla1_jogador1_id,
            dupla1_jogador2_id: req.body.dupla1_jogador2_id,
            dupla2_jogador1_id: req.body.dupla2_jogador1_id,
            dupla2_jogador2_id: req.body.dupla2_jogador2_id,
        };

        console.log('Dados da nova partida:', novaPartida);

        const sqlInsert = `
            INSERT INTO partidas (nome_partida, data_partida, dupla1_jogador1_id, dupla1_jogador2_id, dupla2_jogador1_id, dupla2_jogador2_id)
            VALUES (@nome_partida, @data_partida, @dupla1_jogador1_id, @dupla1_jogador2_id, @dupla2_jogador1_id, @dupla2_jogador2_id);
            SELECT SCOPE_IDENTITY() AS id;`;

        const params = {
            nome_partida: novaPartida.nome_partida,
            data_partida: novaPartida.data_partida,
            dupla1_jogador1_id: novaPartida.dupla1_jogador1_id,
            dupla1_jogador2_id: novaPartida.dupla1_jogador2_id,
            dupla2_jogador1_id: novaPartida.dupla2_jogador1_id,
            dupla2_jogador2_id: novaPartida.dupla2_jogador2_id,
        };

        const result = await db.query(sqlInsert, params);
        const partidaId = result.recordset[0].id;

        res.status(201).json({ id: partidaId, message: 'Partida criada com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar partida:', error);
        res.status(500).json({ message: 'Erro ao criar partida.' });
    }
});

// Endpoint para obter todas as partidas (GET)
router.get('/', async (req, res) => {
    console.log('Recebendo requisição para obter partidas');
    const sqlQuery = 'SELECT * FROM partidas'; 
    
    try {
        const result = await db.query(sqlQuery);
        console.log('Partidas recuperadas:', result.recordset);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Erro ao recuperar partidas:', error);
        res.status(500).json({ message: 'Erro ao recuperar partidas', error });
    }
});

// Endpoint para obter uma partida específica pelo ID (GET)
router.get('/:id', async (req, res) => {
    const partidaId = req.params.id;
    console.log(`Recebendo requisição para obter a partida com ID: ${partidaId}`);

    const sqlQuery = `
        SELECT 
            p.*, 
            j1.nome AS dupla1_jogador1_nome,
            j2.nome AS dupla1_jogador2_nome,
            j3.nome AS dupla2_jogador1_nome,
            j4.nome AS dupla2_jogador2_nome
        FROM partidas p
        LEFT JOIN jogadores j1 ON p.dupla1_jogador1_id = j1.id
        LEFT JOIN jogadores j2 ON p.dupla1_jogador2_id = j2.id
        LEFT JOIN jogadores j3 ON p.dupla2_jogador1_id = j3.id
        LEFT JOIN jogadores j4 ON p.dupla2_jogador2_id = j4.id
        WHERE p.id = @id
    `;

    try {
        const result = await db.query(sqlQuery, { id: partidaId });

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Partida não encontrada' });
        }

        // A partida recuperada incluirá os nomes dos jogadores
        console.log('Partida recuperada:', result.recordset[0]);
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error('Erro ao recuperar a partida:', error);
        res.status(500).json({ message: 'Erro ao recuperar a partida', error });
    }
});

// --- Novos Endpoints para Sets e Games ---

// Endpoint para criar um novo set (POST)
router.post('/:partidaId/sets', async (req, res) => {
    const partidaId = req.params.partidaId;
    console.log('Recebendo requisição para criar set:', req.body);

    try {
        if (!req.body.numero_set || !req.body.pontos_dupla1 || !req.body.pontos_dupla2 || !req.body.resultado_set) {
            console.log('Dados faltando para o set:', req.body);
            return res.status(400).json({ message: 'Dados incompletos para o set.' });
        }

        const novoSet = {
            partida_id: partidaId,
            numero_set: req.body.numero_set,
            pontos_dupla1: req.body.pontos_dupla1,
            pontos_dupla2: req.body.pontos_dupla2,
            resultado_set: req.body.resultado_set,
            parcial_set: req.body.parcial_set,
        };

        const sqlInsertSet = `
            INSERT INTO sets (partida_id, numero_set, pontos_dupla1, pontos_dupla2, resultado_set, parcial_set)
            VALUES (@partida_id, @numero_set, @pontos_dupla1, @pontos_dupla2, @resultado_set, @parcial_set);
            SELECT SCOPE_IDENTITY() AS id;`;

        const paramsSet = {
            partida_id: novoSet.partida_id,
            numero_set: novoSet.numero_set,
            pontos_dupla1: novoSet.pontos_dupla1,
            pontos_dupla2: novoSet.pontos_dupla2,
            resultado_set: novoSet.resultado_set,
            parcial_set: novoSet.parcial_set,
        };

        const resultSet = await db.query(sqlInsertSet, paramsSet);
        const setId = resultSet.recordset[0].id;

        res.status(201).json({ id: setId, message: 'Set criado com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar set:', error);
        res.status(500).json({ message: 'Erro ao criar set.' });
    }
});

// Endpoint para obter todos os sets de uma partida específica (GET)
router.get('/:partidaId/sets', async (req, res) => {
    const partidaId = req.params.partidaId;
    console.log(`Recebendo requisição para obter sets da partida com ID: ${partidaId}`);

    const sqlQuery = `SELECT * FROM sets WHERE partida_id = @partidaId`;

    try {
        const result = await db.query(sqlQuery, { partidaId });
        console.log('Sets recuperados:', result.recordset);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Erro ao recuperar sets:', error);
        res.status(500).json({ message: 'Erro ao recuperar sets', error });
    }
});

// Endpoint para criar um novo game (POST)
router.post('/:partidaId/sets/:setId/games', async (req, res) => {
    const partidaId = req.params.partidaId;
    const setId = req.params.setId;
    console.log('Recebendo requisição para criar game:', req.body);

    try {
        if (!req.body.numero_game || !req.body.pontos_dupla1 || !req.body.pontos_dupla2) {
            console.log('Dados faltando para o game:', req.body);
            return res.status(400).json({ message: 'Dados incompletos para o game.' });
        }

        const novoGame = {
            set_id: setId,
            numero_game: req.body.numero_game,
            pontos_dupla1: req.body.pontos_dupla1,
            pontos_dupla2: req.body.pontos_dupla2,
        };

        const sqlInsertGame = `
            INSERT INTO games (set_id, numero_game, pontos_dupla1, pontos_dupla2)
            VALUES (@set_id, @numero_game, @pontos_dupla1, @pontos_dupla2);
            SELECT SCOPE_IDENTITY() AS id;`;

        const paramsGame = {
            set_id: novoGame.set_id,
            numero_game: novoGame.numero_game,
            pontos_dupla1: novoGame.pontos_dupla1,
            pontos_dupla2: novoGame.pontos_dupla2,
        };

        const resultGame = await db.query(sqlInsertGame, paramsGame);
        const gameId = resultGame.recordset[0].id;

        res.status(201).json({ id: gameId, message: 'Game criado com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar game:', error);
        res.status(500).json({ message: 'Erro ao criar game.' });
    }
});

// Endpoint para obter todos os games de um set específico (GET)
router.get('/:partidaId/sets/:setId/games', async (req, res) => {
    const partidaId = req.params.partidaId;
    const setId = req.params.setId;
    console.log(`Recebendo requisição para obter games do set com ID: ${setId}`);

    const sqlQuery = `SELECT * FROM games WHERE set_id = @setId`;

    try {
        const result = await db.query(sqlQuery, { setId });
        console.log('Games recuperados:', result.recordset);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Erro ao recuperar games:', error);
        res.status(500).json({ message: 'Erro ao recuperar games', error });
    }
});

module.exports = router;
