import time
import numpy as np
import matplotlib.pyplot as plt
from pydub import AudioSegment
from pygame import mixer

def plot_waveform(audio_file):
    """
    音声ファイルの波形を表示し、再生中の現在の秒数を表示する関数。
    
    :param audio_file: 音声ファイルのパス
    """
    # 音声データの読み込み
    audio = AudioSegment.from_file(audio_file)
    samples = np.array(audio.get_array_of_samples())
    sample_rate = audio.frame_rate
    
    # 時間軸の計算
    duration = len(audio) / 1000  # ミリ秒から秒へ変換
    time_axis = np.linspace(0, duration, num=len(samples))
    
    # 波形をプロット
    plt.figure(figsize=(10, 4))
    plt.plot(time_axis, samples, color="blue")
    plt.title("Waveform")
    plt.xlabel("Time (s)")
    plt.ylabel("Amplitude")
    plt.grid()
    plt.show(block=False)
    
    # 音声の再生
    mixer.init()
    mixer.music.load(audio_file)
    mixer.music.play()
    
    # 再生中の現在時間を表示
    start_time = time.time()
    while mixer.music.get_busy():
        current_time = time.time() - start_time
        print(f"\r再生中: {current_time:.2f} 秒", end="")
        time.sleep(0.1)
    
    print("\n再生が終了しました。")

# 使用例
input_mp3 = "./gold_tiger.mp3"  # 入力ファイル名
plot_waveform(input_mp3)
