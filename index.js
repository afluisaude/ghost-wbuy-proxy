// index.js (COM CACHE IMPLEMENTADO)

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const NodeCache = require('node-cache'); // 👈 Importa a biblioteca de cache

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa o cache: TTL (Time To Live) de 300 segundos (5 minutos)
const cache = new NodeCache({ stdTTL: 300 }); 
const CACHE_KEY = 'latest_ghost_posts';

// --- Variáveis de Ambiente ---
const GHOST_API_URL = process.env.GHOST_API_URL; 
const GHOST_CONTENT_KEY = process.env.GHOST_CONTENT_KEY;

// --- Configuração de CORS ---
// Usando o domínio exato da loja Wbuy: https://www.aflui.com
const WBUY_ORIGIN = 'https://www.aflui.com'; 

const corsOptions = {
    origin: WBUY_ORIGIN, 
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// ------------------------------------------------------------------
// ROTA PRINCIPAL: Busca os últimos posts com Caching
// ------------------------------------------------------------------
app.get('/api/latest-posts', async (req, res) => {
    
    // 1. Tenta buscar dados do cache
    const cachedPosts = cache.get(CACHE_KEY);
    if (cachedPosts) {
        // Se o cache existir e for válido (menos de 5 minutos), retorna o cache
        console.log("Servindo posts do cache.");
        return res.status(200).json(cachedPosts);
    }
    
    // 2. Se não estiver no cache, constrói a URL para o Ghost
    const ghostUrl = `${GHOST_API_URL}/ghost/api/v4/content/posts/?key=${GHOST_CONTENT_KEY}&limit=4&fields=title,slug,feature_image,published_at,excerpt`;

    try {
        const response = await fetch(ghostUrl);
        
        if (!response.ok) {
            console.error(`Erro na API do Ghost: ${response.status}`);
            return res.status(502).json({ 
                error: "Falha ao buscar dados do Ghost." 
            });
        }
        
        const data = await response.json();
        const postsData = { posts: data.posts };

        // 3. Armazena os dados no cache antes de retornar
        cache.set(CACHE_KEY, postsData);
        console.log("Posts atualizados e armazenados em cache.");
        
        // 4. Retorna os dados
        res.status(200).json(postsData);

    } catch (error) {
        console.error("Erro interno ao processar requisição:", error.message);
        res.status(500).json({ error: "Erro interno do servidor proxy." });
    }
});

// ROTA DE SAÚDE
app.get('/', (req, res) => {
    res.status(200).send(`Ghost Wbuy Proxy Service is running with Caching. Origin allowed: ${WBUY_ORIGIN}`);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}. Caching enabled.`);
});
