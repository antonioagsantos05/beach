const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajuste o caminho se necessário

// --- Endpoints para Sets ---

// Endpoint para criar um novo set (POST)
router.post('/:partidaId/sets', async (req, res) => {
    const partidaId = req.params.partidaId;
    const { numero_set, pontos_dupla1, pontos_dupla2, resultado_set, parcial_set } = req.body;

    try {
        if (!numero_set || pontos_dupla1 === undefined || pontos_dupla2 === undefined || !resultado_set) {
            return res.status(400).json({ message: 'Dados incompletos para o set.' });
        }

        const sqlInsertSet = `
            INSERT INTO sets (partida_id, numero_set, pontos_dupla1, pontos_dupla2, resultado_set, parcial_set)
            VALUES (@partida_id, @numero_set, @pontos_dupla1, @pontos_dupla2, @resultado_set, @parcial_set);
            SELECT SCOPE_IDENTITY() AS id;`;

        const paramsSet = {
            partida_id: partidaId,
            numero_set,
            pontos_dupla1,
            pontos_dupla2,
            resultado_set,
            parcial_set,
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
    try {
        const sqlQuery = `SELECT * FROM sets WHERE partida_id = @partidaId`;
        const result = await db.query(sqlQuery, { partidaId });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Erro ao recuperar sets:', error);
        res.status(500).json({ message: 'Erro ao recuperar sets', error });
    }
});

// --- Endpoints para Games ---

// Endpoint para criar um novo game (POST)
router.post('/:partidaId/sets/:setId/games', async (req, res) => {
    const partidaId = req.params.partidaId;
    const setId = req.params.setId;
    const { numero_game, pontos_dupla1, pontos_dupla2 } = req.body;

    try {
        if (!numero_game || pontos_dupla1 === undefined || pontos_dupla2 === undefined) {
            return res.status(400).json({ message: 'Dados incompletos para o game.' });
        }

        const sqlInsertGame = `
            INSERT INTO games (set_id, numero_game, pontos_dupla1, pontos_dupla2)
            VALUES (@set_id, @numero_game, @pontos_dupla1, @pontos_dupla2);
            SELECT SCOPE_IDENTITY() AS id;`;

        const paramsGame = {
            set_id: setId,
            numero_game,
            pontos_dupla1,
            pontos_dupla2,
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
    const setId = req.params.setId;
    try {
        const sqlQuery = `SELECT * FROM games WHERE set_id = @setId`;
        const result = await db.query(sqlQuery, { setId });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Erro ao recuperar games:', error);
        res.status(500).json({ message: 'Erro ao recuperar games', error });
    }
});

module.exports = router;
