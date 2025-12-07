// index.js

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; 

// --- Variáveis de Ambiente (Configuradas no Railway) ---
const GHOST_API_URL = process.env.GHOST_API_URL;
const GHOST_CONTENT_KEY = process.env.GHOST_CONTENT_KEY;

// --- Configuração de CORS (Segurança) ---
// CORREÇÃO: Usando o domínio exato da loja Wbuy fornecido pelo usuário.
const WBUY_ORIGIN = 'https://www.aflui.com'; 

const corsOptions = {
    // Permite que apenas o domínio 'https://www.aflui.com' acesse esta API.
    origin: WBUY_ORIGIN, 
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// ------------------------------------------------------------------
// ROTA PRINCIPAL: Busca os últimos posts do Ghost
// ------------------------------------------------------------------
app.get('/api/latest-posts', async (req, res) => {
    
    // 1. Constrói a URL da API do Ghost com as variáveis de ambiente e parâmetros
    // Note: Usamos o GHOST_API_URL (https://blog.aflui.com) para buscar os posts.
    const ghostUrl = `${GHOST_API_URL}/ghost/api/v4/content/posts/?key=${GHOST_CONTENT_KEY}&limit=4&fields=title,slug,feature_image,published_at,excerpt`;

    try {
        const response = await fetch(ghostUrl);
        
        if (!response.ok) {
            console.error(`Erro na API do Ghost: ${response.status} - ${response.statusText}`);
            return res.status(502).json({ 
                error: "Falha ao buscar dados do Ghost. Verifique chaves ou URL base." 
            });
        }
        
        const data = await response.json();
        
        // 4. Retorna os dados de forma limpa para a Wbuy
        res.status(200).json({ posts: data.posts });

    } catch (error) {
        console.error("Erro interno ao processar requisição:", error.message);
        res.status(500).json({ error: "Erro interno do servidor proxy." });
    }
});

// ------------------------------------------------------------------
// ROTA DE SAÚDE
// ------------------------------------------------------------------
app.get('/', (req, res) => {
    res.status(200).send(`Ghost Wbuy Proxy Service is running on port ${PORT}. Origin allowed: ${WBUY_ORIGIN}`);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
