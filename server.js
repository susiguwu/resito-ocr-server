const fs = require('fs');
const vision = require('@google-cloud/vision');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ✅ 將環境變數中的金鑰內容寫入 /tmp
const keyPath = '/tmp/gcloud-key.json';
fs.writeFileSync(keyPath, process.env.GOOGLE_CREDENTIALS_JSON);

const client = new vision.ImageAnnotatorClient({
  keyFilename: keyPath,
});

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.get('/ping', (_, res) => res.send('OCR Server is running!'));

app.post('/ocr', async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ error: '缺少圖片 base64' });

    const [result] = await client.textDetection({ image: { content: base64 } });
    const detections = result.textAnnotations;
    const text = detections.length > 0 ? detections[0].description : '';
    res.json({ text });
  } catch (err) {
    console.error('🔴 OCR 錯誤:', err);
    res.status(500).json({ error: 'OCR failed', details: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ OCR server listening on 0.0.0.0:${PORT}`);
});
