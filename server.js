const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();
const port = process.env.PORT || 3000;

// Remplacez par votre clé API
const apiKey = process.env.API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey);

app.use(cors()); // Permet les requêtes cross-origin (important pour Render)
app.use(express.json({ limit: '50mb' })); // Permet de recevoir des JSON, limite augmentée pour les images
app.use(fileUpload());
app.use(express.static('public')); // Assurez-vous que votre HTML est dans un dossier 'public'

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const history = req.body.history || [];
        const image = req.body.image; // Image en base64, si présente

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // ou gemini-pro-vision
        const chat = model.startChat({
            history: history, // l'historique des conversations est passé au back-end
        });

        let result;
        if (image) {
            // S'il y a une image, utilisez gemini-pro-vision
            const base64WithoutPrefix = image.split(',')[1];
            const imagePart = {
                inlineData: {
                    data: base64WithoutPrefix,
                    mimeType: 'image/jpeg' // ou 'image/png', selon le type d'image
                }
            };
            result = await model.generateContent([userMessage, imagePart]);
        } else {
            // Sinon, utilisez gemini-pro
            result = await chat.sendMessage(userMessage);
        }

        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la communication avec l'IA" });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});