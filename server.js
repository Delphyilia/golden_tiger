const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.json());

const AUDIO_DIR = path.join(__dirname, './public/audio'); // 音声ファイルのディレクトリ
console.log('AUDIO_DIR:', AUDIO_DIR);


// 音声生成エンドポイント
app.post('/generate-audio', (req, res) => {
  const text = req.body.text;

  // 入力検証（ひらがなのみ、20文字以下）
  const regex = /^[\u3041-\u3096]+$/;
  if (!regex.test(text) || text.length > 20) {
    return res.status(400).send('無効な入力です。ひらがな20文字以内で入力してください。');
  }

  // 音声ファイルリストを作成
  const audioFiles = Array.from(text).map(char => path.join(AUDIO_DIR, `${char}.mp3`));

  // ファイル存在チェック
  for (const file of audioFiles) {
    if (!fs.existsSync(file)) {
      return res.status(400).send(`音声ファイルが見つかりません: ${file}`);
    }
  }

  // 出力ファイル名
  const outputFile = path.join(__dirname, 'output', `output_${Date.now()}.mp3`);

  // FFmpegコマンドで音声ファイルを結合
  const command = `ffmpeg -y -i "concat:${audioFiles.join('|')}" -acodec copy ${outputFile}`;
  exec(command, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('音声生成に失敗しました。');
    }

    // ファイルをクライアントに送信
    res.download(outputFile, () => fs.unlinkSync(outputFile)); // 送信後に一時ファイルを削除
  });
});



// 静的ファイルを配信
app.use(express.static(path.join(__dirname, 'public'))); // フロントエンド用ファイルは 'public' ディレクトリに置く

// すべてのリクエストを index.html にリダイレクト
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
});
