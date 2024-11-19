const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { configDotenv } = require('dotenv');
const cron = require('node-cron');  // Importar o node-cron

configDotenv();

// Criar o app Express
const app = express();

// Configurar CORS (se necessário para o seu front-end)
app.use(cors());

// Definir a porta
const PORT = process.env.PORT || 3000;

// Variável para armazenar as notícias
let noticiasCache = [];

// Função para atualizar as notícias
async function atualizarNoticias() {
    try {
        // URL da API de notícias (NewsAPI)
        const url = `https://newsapi.org/v2/everything?q=contábil&apiKey=${process.env.APIKEY}`;

        // Fazer a requisição à API externa (NewsAPI)
        const response = await axios.get(url);
        const articles = response.data.articles;

        // Criar uma estrutura simplificada para as notícias
        noticiasCache = articles.slice(0, 5).map(article => ({
            link: article.url,
            titulo: article.title,
            descricao: article.description,
            img: article.urlToImage
        }));

        console.log('Notícias atualizadas com sucesso.');
    } catch (error) {
        console.error('Erro ao atualizar as notícias:', error);
    }
}

// Agendar a atualização das notícias todos os dias às 00:00 (meia-noite)
cron.schedule('0 0 * * *', async () => {
    await atualizarNoticias();
});

// Chamar a função uma vez logo no início para garantir que as notícias estejam carregadas
atualizarNoticias();

// Rota para pegar as notícias
app.get('/noticias', (req, res) => {
    res.json(noticiasCache);
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
