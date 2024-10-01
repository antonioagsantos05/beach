// routes/controlPlayers.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajuste o caminho se necessário

// Função para tratar erros e enviar resposta
const handleError = (res, message, error) => {
    console.error(message, error);
    res.status(500).json({ message, error });
};

// Rota para obter todos os jogadores
router.get('/', async (req, res) => {
    console.log('Recebendo requisição para obter todos os jogadores'); // Log
    try {
        const jogadores = await db.query('SELECT * FROM jogadores'); // Chama a função de consulta
        if (jogadores.length === 0) {
            return res.status(404).json({ message: 'Nenhum jogador encontrado' });
        }

        console.log('Jogadores encontrados:', jogadores); // Log dos jogadores
        res.json(jogadores);
    } catch (error) {
        handleError(res, 'Erro ao obter jogadores', error);
    }
});

// Rota para obter um jogador específico por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [jogador] = await db.query('SELECT * FROM jogadores WHERE id = ?', [id]);

        if (!jogador.length) {
            return res.status(404).json({ message: 'Jogador não encontrado' });
        }

        res.json(jogador[0]); // Retorna apenas o jogador encontrado
    } catch (error) {
        handleError(res, 'Erro ao obter jogador', error);
    }
});

// Rota para adicionar um novo jogador
router.post('/', async (req, res) => {
    const { nome, idade, usuario_id } = req.body; // Incluindo usuario_id
    try {
        if (!usuario_id) {
            return res.status(400).json({ message: 'usuario_id é obrigatório' });
        }

        if (!nome || !idade) {
            return res.status(400).json({ message: 'Nome e idade são obrigatórios' });
        }

        if (idade <= 0) {
            return res.status(400).json({ message: 'Idade deve ser maior que 0' });
        }

        // Verifique se o usuario_id existe
        const [usuarioExists] = await db.query('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
        if (!usuarioExists.length) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const [resultado] = await db.query('INSERT INTO jogadores (nome, idade, usuario_id) VALUES (?, ?, ?)', [nome, idade, usuario_id]);
        const novoJogador = { id: resultado.insertId, nome, idade, usuario_id };
        res.status(201).json(novoJogador);
    } catch (error) {
        handleError(res, 'Erro ao adicionar jogador', error);
    }
});

module.exports = router;
