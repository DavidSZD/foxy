const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path'); // Importez le module path
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Serveur de fichier statique
app.use(express.static(path.join(__dirname, 'public'))); // "public" est le nom du dossier contenant vos fichiers statiques

const apiKey = process.env.API_KEY; // Utilisez votre variable d'environnement pour la clé API

app.post('/api/generate', async (req, res) => {
  try {
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get a response from the AI" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});