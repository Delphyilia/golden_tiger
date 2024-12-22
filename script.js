// MP3ファイル名のリスト（連番以外）
const mp3Files = [
    "お前の苦労をずっと見てたぞ.mp3",
    "これまでの苦労は全て水の泡だ.mp3",
    "そんな現実から抜け出す時が来た.mp3",
    "ついに我慢が報われ莫大な富を得る.mp3",
    "収入は増えず金は出てく一方.mp3",
    "将来に希望を持てず疲弊する日々.mp3",
    "散らかり倒した狭い部屋を飛び出し.mp3",
    "本当によく頑張ったな.mp3",
    "節約ばかりの生活.mp3",
    "贅沢で余裕のある生活を実現し.mp3"
  ];
  
  // ボタンコンテナを取得
  const buttonContainer = document.getElementById("button-container");
  
  // MP3ファイルごとにボタンを生成
  mp3Files.forEach(fileName => {
    // ボタンを作成
    const button = document.createElement("button");
    button.textContent = fileName.replace(".mp3", ""); // 拡張子を削除して表示
  
    // クリックイベントを設定
    button.addEventListener("click", () => {
      // 音声を再生
      const audio = new Audio(fileName);
      audio.play();
    });
  
    // コンテナにボタンを追加
    buttonContainer.appendChild(button);
  });
  