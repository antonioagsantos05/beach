const express = require('express');
const router = express.Router();
const db = require('../db.js'); // Ajuste o caminho conforme necessário

// Endpoint para buscar jogadores por usuarioId
router.get('/:usuario_id', async (req, res) => {
    const usuarioId = parseInt(req.params.usuario_id, 10); // Garantir que o ID seja um número

    console.log('Requisição recebida para buscar jogadores. usuarioId:', usuarioId); // Log adicionado

    try {
        const sqlQuery = 'SELECT * FROM jogadores WHERE usuario_id = @usuarioId';
        const result = await db.query(sqlQuery, { usuarioId }); // Passando o usuário ID como parâmetro

        res.json(result.recordset); // Retornar os jogadores encontrados
    } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
        res.status(500).json({ error: 'Erro ao buscar jogadores' });
    }
});

// Endpoint para adicionar um novo jogador
router.post('/', async (req, res) => {
    const { nome, usuario_id, idade } = req.body; // Desestruturar os dados do corpo da requisição

    console.log('Requisição recebida para adicionar jogador:', req.body); // Log adicionado

    // Validação básica
    if (!nome || !usuario_id || !idade) {
        return res.status(400).json({ error: 'Nome, usuario_id e idade são obrigatórios' });
    }

    try {
        const sqlQuery = 'INSERT INTO jogadores (nome, usuario_id, idade) VALUES (@nome, @usuario_id, @idade)';
        await db.query(sqlQuery, { nome, usuario_id, idade }); // Passando os dados como parâmetros

        res.status(201).json({ message: 'Jogador adicionado com sucesso!' }); // Resposta de sucesso
    } catch (error) {
        console.error('Erro ao adicionar jogador:', error);
        res.status(500).json({ error: 'Erro ao adicionar jogador' });
    }
});


module.exports = router;
