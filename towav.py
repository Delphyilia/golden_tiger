import os
import subprocess

def convert_mp3_to_wav(input_dir, output_dir):
    """
    指定したディレクトリ内のMP3ファイルをWAV形式に変換する。

    Args:
        input_dir (str): MP3ファイルが保存されているディレクトリのパス
        output_dir (str): WAVファイルを保存するディレクトリのパス
    """
    # 出力ディレクトリが存在しない場合は作成
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 入力ディレクトリ内のファイルを走査
    for filename in os.listdir(input_dir):
        if filename.endswith('.mp3'):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, os.path.splitext(filename)[0] + '.wav')

            # FFmpegコマンドを構築
            command = ['ffmpeg', '-i', input_path, output_path]

            # コマンドを実行
            try:
                print(f'Converting {filename} to WAV...')
                subprocess.run(command, check=True)
                print(f'Conversion complete: {output_path}')
            except subprocess.CalledProcessError as e:
                print(f'Error converting {filename}: {e}')

# 使用例
input_directory = './public/audio'  # MP3ファイルが保存されているディレクトリ
output_directory = './public/audio'  # WAVファイルを保存するディレクトリ

convert_mp3_to_wav(input_directory, output_directory)
