import express from 'express';
import multer from 'multer';
import { ExifTool } from 'exiftool-vendored';
import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });
const exiftool = new ExifTool();

// Initialize OpenAI client
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

app.post('/generate', upload.single('image'), async (req, res) => {
    try {
        const filePath = req.file.path;

        // Read file bytes
        const fileBytes = fs.readFileSync(filePath, { encoding: 'base64' });
        
        // Generate metadata via OpenAI
        const metaPrompt = `Generate a concise title (≤ 10 words), a 1–2 sentence description, and 10 SEO keywords for this JPEG image. Respond as JSON with keys title, description, keywords.`;
        const completion = await openai.createChatCompletion({
            model: 'gpt-40',
            messages: [{ role: 'system', content: 'You are a helpful metadata generator.' },
            { role: 'user', content: metaPrompt }]
        });
        const meta = JSON.parse(completion.data.choices[0].message.content);
    
        // Inject IPTC tags using ExifTool
        const outPath = path.join('outputs', `${req.file.filename}.jpg`);

        await exiftool.write(filePath, {
            Title: meta.title,
            Description: meta.description,
            Keywords: meta.keywords
        }, ['-overwrite_original', `-o`, outPath]);
        // Send the tagged image
        res.sendFile(path.resolve(outPath));

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating metadata or writing tags.');
    } finally {
        exiftool.end();
    }
});

app.listen(3000, () => console.log('Server on http://localhost:3000'));

