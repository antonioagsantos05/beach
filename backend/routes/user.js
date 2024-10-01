require('dotenv').config(); // Carregar variáveis de ambiente
const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajuste o caminho se necessário
const bcrypt = require('bcrypt'); // Para hash de senhas
const jwt = require('jsonwebtoken'); // Para geração de tokens JWT

// Função auxiliar para lidar com erros
const handleError = (res, err, message) => {
  console.error(message, err);
  return res.status(500).json({ error: message });
};

// Rota GET para buscar todos os usuários
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, nome FROM usuarios', {});
    console.log('Usuários encontrados:', result.recordset); // Log de usuários encontrados
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err, 'Erro ao buscar usuários');
  }
});

// Rota POST para adicionar um novo usuário
router.post('/', async (req, res) => {
  const { nome, senha } = req.body;
  console.log('Dados recebidos para criação de usuário:', { nome });

  try {
    // Verifica se nome e senha foram fornecidos
    if (!nome || !senha) {
      console.warn('Nome ou senha não fornecidos');
      return res.status(400).json({ error: 'Nome e senha são obrigatórios' });
    }

    // Verifica se o nome de usuário já existe
    const userExists = await db.query('SELECT id FROM usuarios WHERE nome = @nome', { nome });

    // Verifica se o resultado da consulta é válido
    if (userExists && userExists.recordset && userExists.recordset.length > 0) {
      console.warn('Usuário já existe:', nome);
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);
    await db.query('INSERT INTO usuarios (nome, senha) VALUES (@nome, @senha)', {
      nome,
      senha: hashedPassword,
    });

    console.log('Usuário adicionado com sucesso:', nome);
    res.status(201).json({ message: 'Usuário adicionado com sucesso' });
  } catch (err) {
    handleError(res, err, 'Erro ao adicionar usuário');
  }
});

// Rota POST para login
router.post('/login', async (req, res) => {
  const { nome, senha } = req.body;
  console.log('Tentativa de login:', { nome });

  try {
    // Consulta para verificar se o usuário existe
    const result = await db.query('SELECT id, senha FROM usuarios WHERE nome = @nome', { nome });

    if (!result || result.recordset.length === 0) {
      console.warn('Usuário não encontrado:', nome);
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }

    const usuario = result.recordset[0];

    // Verificação da senha
    const passwordMatch = await bcrypt.compare(senha, usuario.senha);
    console.log('Senha correta?', passwordMatch);

    if (!passwordMatch) {
      console.warn('Senha inválida para usuário:', nome);
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }

    // Geração do token JWT
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token gerado:', token);
    res.json({ message: 'Login bem-sucedido', token });
  } catch (err) {
    handleError(res, err, 'Erro ao realizar login');
  }
});

module.exports = router;
