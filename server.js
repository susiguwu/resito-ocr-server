const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const vision = require('@google-cloud/vision');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new vision.ImageAnnotatorClient();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/ocr', async (req, res) => {
  try {
    const { base64 } = req.body;
    const [result] = await client.textDetection({ image: { content: base64 } });
    const detections = result.textAnnotations;
    const text = detections.length > 0 ? detections[0].description : '';
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OCR failed' });
  }
});

app.get('/', (req, res) => {
  res.send('OCR Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
