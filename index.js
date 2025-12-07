// index.js

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // Necessário para permitir que a Wbuy acesse este servidor

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS: Permitir acesso apenas do domínio da sua loja Wbuy
// Substitua 'https://sua-loja.wbuy.com.br' pelo domínio real.
const corsOptions = {
    origin: 'https://sua-loja.wbuy.com.br', 
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Variáveis de Ambiente ---
// O Railway irá injetar estas variáveis, mantendo suas chaves seguras.
const GHOST_API_URL = process.env.GHOST_API_URL; 
const GHOST_CONTENT_KEY = process.env.GHOST_CONTENT_KEY;

// Endpoint para buscar os últimos artigos
app.get('/api/latest-posts', async (req, res) => {
    
    // Configura a URL da API do Ghost com os parâmetros desejados
    const ghostUrl = `${GHOST_API_URL}/ghost/api/v4/content/posts/?key=${GHOST_CONTENT_KEY}&limit=3&fields=title,slug,feature_image,published_at,excerpt`;

    try {
        const response = await fetch(ghostUrl);
        
        // Verifica se a chamada à API do Ghost foi bem-sucedida
        if (!response.ok) {
            console.error(`Erro na API do Ghost: ${response.statusText}`);
            return res.status(response.status).json({ 
                error: "Falha ao buscar dados do Ghost." 
            });
        }
        
        const data = await response.json();
        
        // Retorna apenas a lista de posts para a Wbuy
        res.status(200).json({ posts: data.posts });

    } catch (error) {
        console.error("Erro interno ao processar requisição:", error);
        res.status(500).json({ error: "Erro interno do servidor proxy." });
    }
});

// Rota básica de saúde (opcional)
app.get('/', (req, res) => {
    res.send('Ghost Wbuy Proxy Service is running.');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
