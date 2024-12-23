from pydub import AudioSegment

def trim_mp3(input_file, output_file, start_time_ms, end_time_ms):
    """
    MP3ファイルを指定のミリ秒数でトリミングする関数
    
    :param input_file: 入力MP3ファイルのパス
    :param output_file: 出力MP3ファイルのパス
    :param start_time_ms: トリミング開始時間（ミリ秒）
    :param end_time_ms: トリミング終了時間（ミリ秒）
    """
    # MP3ファイルを読み込む
    audio = AudioSegment.from_file(input_file, format="mp3")
    
    # 音声をトリミング
    trimmed_audio = audio[start_time_ms:end_time_ms]
    
    # 新しいMP3ファイルとして保存
    trimmed_audio.export(output_file, format="mp3")
    print(f"新しいMP3ファイルを保存しました: {output_file}")

# 使用例
input_mp3 = "./gold_tiger.mp3"  # 入力ファイル名
output_mp3 = "output7.mp3"       # 出力ファイル名
start_ms = 37500                  # 開始時間（ミリ秒）
end_ms = 40100                 # 終了時間（ミリ秒）

trim_mp3(input_mp3, output_mp3, start_ms, end_ms)


'''
0~2200

2200~4150
4150~7220
~11900
~17900
~20500
~23190
~25500
~28100
~30750
~33450
~37500
'''