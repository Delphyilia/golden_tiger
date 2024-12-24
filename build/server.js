const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // fetch を使用するために追加
const WavDecoder = require('wav-decoder');
const WavEncoder = require('wav-encoder');

const fs = require('fs/promises');


const app = express();
app.use(bodyParser.json());

app.post('/generate-audio', async (req, res) => {
  const text = req.body.text;

  // 入力検証（ひらがなのみ、20文字以内）
  const regex = /^[\u3041-\u3096]+$/;
  if (!regex.test(text) || text.length > 20) {
    return res.status(400).send('無効な入力です。ひらがな20文字以内で入力してください。');
  }

  // 静的ファイルへの HTTP URL を作成
  const audioFiles = Array.from(text).map(char => `https://${req.headers.host}/audio/${char}.wav`);

  try {
// WAV ファイルのデコードと結合処理
const audioBuffers = await Promise.all(
  audioFiles.map(async (file) => {
    const buffer = await fs.readFile(file,'utf8',  (err, data) => {
      if (err) {
        console.error('エラー:', err);
        return;
      }
      console.log('ファイルの内容:', data);
    }); // ファイルを読み込む (Buffer として)
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength); // ArrayBuffer に変換
    return arrayBuffer;
  })
);

const audioData = [];
let sampleRate = null;

for (const arrayBuffer of audioBuffers) {
  try {
    const decoded = await WavDecoder.decode(arrayBuffer);

    if (!sampleRate) {
      sampleRate = decoded.sampleRate;
    } else if (sampleRate !== decoded.sampleRate) {
      return res.status(400).send('すべての音声ファイルのサンプルレートが一致している必要があります。');
    }

    audioData.push(decoded.channelData);
  } catch (error) {
    console.error('WAV ファイルのデコードに失敗しました:', error);
    return res.status(500).send('音声ファイルのデコードに失敗しました。');
  }
}

    // 音声の結合処理
    const numChannels = audioData[0].length;
    const combinedChannelData = Array.from({ length: numChannels }, (_, i) =>
      Float32Array.from(audioData.map(channelData => channelData[i]).flat())
    );

    const audioForEncoder = {
      sampleRate,
      channelData: combinedChannelData,
    };

    // WAV エンコード
    const encodedWav = await WavEncoder.encode(audioForEncoder);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', `attachment; filename="output.wav"`);
    res.send(Buffer.from(encodedWav));
  } catch (error) {
    console.error('音声生成に失敗しました:', error);
    res.status(500).send('音声生成に失敗しました。');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
});
