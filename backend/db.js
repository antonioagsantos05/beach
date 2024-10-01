const sql = require('mssql');

const config = {
    user: 'antonio_augs', // Seu nome de usuário
    password: '23@0Portuguesa', // Sua senha
    server: 'beachtennis.database.windows.net', // Nome do servidor
    database: 'bancoBeach', // Nome do banco de dados
    options: {
        encrypt: true, // Para Azure
        trustServerCertificate: true // Usar em desenvolvimento
    }
};

// Função para conectar ao banco de dados
async function connectDB() {
    try {
        await sql.connect(config);
        console.log('Conectado ao banco de dados com sucesso!');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    }
}

// Conectar ao banco ao iniciar o módulo
connectDB();

// Exportando a função de query
module.exports = {
    query: async (sqlQuery, params = {}) => {
        console.log('Executando query:', sqlQuery, 'com parâmetros:', params);
        try {
            const request = new sql.Request();

            // Validando e adicionando os parâmetros à requisição
            for (const key in params) {
                if (params[key] === undefined || params[key] === null) {
                    console.warn(`Parâmetro ${key} não pode ser nulo ou indefinido`);
                    continue; // Ignora parâmetros inválidos
                }

                if (key === 'usuarioId') {
                    const usuarioId = parseInt(params[key], 10);
                    if (isNaN(usuarioId)) throw new Error(`usuarioId deve ser um número: ${params[key]}`);
                    request.input(key, sql.Int, usuarioId);
                } else if (key === 'idade' || key === 'id') {
                    const intValue = parseInt(params[key], 10);
                    if (isNaN(intValue)) throw new Error(`Idade/id deve ser um número: ${params[key]}`);
                    request.input(key, sql.Int, intValue);
                } else {
                    request.input(key, sql.NVarChar, params[key]);
                }
            }

            const result = await request.query(sqlQuery);
            console.log('Resultado da query:', result);
            return result.recordset; // Retorna apenas o recordset
        } catch (err) {
            console.error('Erro ao executar a consulta:', err);
            throw err; // Re-lança o erro para que possa ser tratado onde a função é chamada
        }
    }
};
