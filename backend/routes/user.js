const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajuste o caminho se necessário
const bcrypt = require('bcrypt'); // Para hash de senhas

// Rota GET para buscar todos os usuários
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM usuarios', {});
        console.log('Usuários encontrados:', result.recordset); // Log de usuários encontrados
        res.json(result.recordset);
    } catch (err) {
        console.error('Erro ao buscar usuários:', err); // Log de erro
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// Rota POST para adicionar um novo usuário
router.post('/', async (req, res) => {
    const { nome, senha } = req.body;
    try {
        // Verifica se nome e senha foram fornecidos
        if (!nome || !senha) {
            console.warn('Nome ou senha não fornecidos'); // Log de advertência
            return res.status(400).json({ error: 'Nome e senha são obrigatórios' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10); // Hash da senha
        await db.query('INSERT INTO usuarios (nome, senha) VALUES (@nome, @senha)', {
            nome,
            senha: hashedPassword,
        });
        console.log('Usuário adicionado com sucesso:', nome); // Log de sucesso
        res.status(201).json({ message: 'Usuário adicionado com sucesso' });
    } catch (err) {
        console.error('Erro ao adicionar usuário:', err); // Log de erro
        res.status(500).json({ error: 'Erro ao adicionar usuário' });
    }
});

// Rota POST para login
router.post('/login', async (req, res) => {
    const { nome, senha } = req.body;
    console.log('Tentativa de login:', { nome }); // Log de tentativa de login
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE nome = @nome', { nome });
        const usuario = result.recordset[0];

        if (!usuario) {
            console.warn('Usuário não encontrado:', nome); // Log de usuário não encontrado
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        const passwordMatch = await bcrypt.compare(senha, usuario.senha);
        if (!passwordMatch) {
            console.warn('Senha inválida para usuário:', nome); // Log de senha inválida
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        // Se o login for bem-sucedido, você pode gerar um token JWT aqui
        console.log('Login bem-sucedido para:', nome); // Log de sucesso no login
        res.json({ message: 'Login bem-sucedido', token: 'SEU_TOKEN_AQUI' });
    } catch (err) {
        console.error('Erro ao realizar login:', err); // Log de erro
        res.status(500).json({ error: 'Erro ao realizar login' });
    }
});

module.exports = router;