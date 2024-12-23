import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import WavEncoder from 'wav-encoder';  // wav-encoderをインポート
import WavDecoder from 'wav-decoder';  // wav-decoderをインポートしてWAVファイルをデコード

const app = express();
app.use(bodyParser.json());

const AUDIO_DIR = path.join(__dirname, './public/audio');

// 音声生成エンドポイント
app.post('/generate-audio', async (req, res) => {
  const text = req.body.text;

  // 入力検証（ひらがなのみ、20文字以下）
  const regex = /^[\u3041-\u3096]+$/;
  if (!regex.test(text) || text.length > 20) {
    return res.status(400).send('無効な入力です。ひらがな20文字以内で入力してください。');
  }

  // 音声ファイルリストを作成
  const audioFiles = Array.from(text).map(char => path.join(AUDIO_DIR, `${char}.wav`));

  // ファイル存在チェック
  for (const file of audioFiles) {
    if (!fs.existsSync(file)) {
      return res.status(400).send(`音声ファイルが見つかりません: ${file}`);
    }
  }

  // WAVファイルのバイナリデータを読み込む
  const audioBuffers = await Promise.all(audioFiles.map(file => fs.promises.readFile(file)));

  // 各WAVファイルをデコードしてサンプルデータを取得
  const audioData = [];
  for (const buffer of audioBuffers) {
    try {
      const decoded = await WavDecoder.decode(buffer);
      audioData.push(decoded.channelData);
    } catch (error) {
      console.error('WAVファイルのデコードに失敗しました:', error);
      return res.status(500).send('音声ファイルのデコードに失敗しました。');
    }
  }

  // チャネルデータを1つに結合
  const combinedChannelData = audioData.flat();

  // エンコードするために正しい形式に変換
  const audioForEncoder = {
    sampleRate: 44100,  // サンプルレート（例: 44100Hz）
    channelData: combinedChannelData  // チャネルデータ（モノラル/ステレオ）
  };

  // エンコード
  try {
    const encodedWav = await WavEncoder.encode(audioForEncoder);

    // 結果のファイルをレスポンスとして送信
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', `attachment; filename="output.wav"`);
    res.send(encodedWav);
  } catch (error) {
    console.error('音声生成に失敗しました:', error);
    res.status(500).send('音声生成に失敗しました。');
  }
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
});
