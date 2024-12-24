import express from 'express';
import bodyParser from 'body-parser';
import { promises as fs } from 'fs';
import path from 'path';
import ffmpeg from '@ffmpeg/ffmpeg';

const { createFFmpeg, fetchFile } = ffmpeg;

const ffmpegInstance = createFFmpeg({ log: true });



app.post('/generate-audio', async (req, res) => {
  const text = req.body.text;

  // 入力検証（ひらがなのみ、20文字以内）
  const regex = /^[\u3041-\u3096]+$/;
  if (!regex.test(text) || text.length > 20) {
    return res.status(400).send('無効な入力です。ひらがな20文字以内で入力してください。');
  }

  // ファイル URL を構築
  const audioFiles = Array.from(text).map(char => path.join('./public/', `${char}.wav`));

  // ファイル存在チェック
  for (const file of audioFiles) {
    try {
      const filePath = path.join(process.cwd(), file); // プロジェクトのルートを基準に解決
      await fs.access(filePath);
    } catch {
      return res.status(400).send(`音声ファイルが見つかりません: ${file}`);
    }
  }

  // FFmpegの準備
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  // ファイルをFFmpegに書き込み
  for (let i = 0; i < audioFiles.length; i++) {
    const filePath = path.join(process.cwd(), audioFiles[i]);
    const fileData = await fs.readFile(filePath);
    ffmpeg.FS('writeFile', `input${i}.wav`, await fetchFile(fileData));
  }

  // 結合するためのリストファイルを作成
  const concatList = audioFiles.map((_, i) => `file 'input${i}.wav'`).join('\n');
  ffmpeg.FS('writeFile', 'filelist.txt', concatList);

  // WAVファイルを結合
  try {
    await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'filelist.txt', '-c', 'copy', 'output.wav');

    // 結合結果を取得
    const data = ffmpeg.FS('readFile', 'output.wav');

    // クライアントに返却
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', 'attachment; filename="output.wav"');
    res.send(Buffer.from(data));
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
