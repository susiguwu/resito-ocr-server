const express = require('express');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');
const cors = require('cors');
const app = express();
const PORT = 3000;
const fs = require('fs');
const path = require('path');

const keyPath = '/tmp/gcloud-key.json';

// 將 JSON 環境變數內容寫入 tmp 金鑰檔案
fs.writeFileSync(keyPath, process.env.GOOGLE_CREDENTIALS_JSON);

const client = new vision.ImageAnnotatorClient({
  keyFilename: keyPath
});

// ✅ 自動讀取 GOOGLE_APPLICATION_CREDENTIALS 所指定的金鑰
const client = new vision.ImageAnnotatorClient();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// OCR 端點
app.post('/ocr', async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ error: '缺少圖片 base64' });

    const [result] = await client.textDetection({
      image: { content: base64 },
    });

    const detections = result.textAnnotations;
    const text = detections.length > 0 ? detections[0].description : '';
    res.json({ text });
  } catch (err) {
    console.error('🔴 OCR 錯誤:', err);
    res.status(500).json({ error: 'OCR failed', details: err.message });
  }
});

app.get('/ping', (_, res) => res.send('OCR Server is running!'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ OCR server listening on 0.0.0.0:${PORT}`);
});
