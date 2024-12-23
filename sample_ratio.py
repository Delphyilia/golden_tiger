import wave
from pydub.utils import mediainfo

def get_sample_rate(file_path):
    with wave.open(file_path, 'rb') as wf:
        sample_rate = wf.getframerate()
        print(f"Sample Rate: {sample_rate} Hz")
        return sample_rate
    
def get_channels(file_path):
    info = mediainfo(file_path)
    num_channels = int(info['channels'])
    print(f"Number of Channels: {num_channels}")
    return num_channels

# 使用例
file_path = './build/public/audio/あ.wav'
get_sample_rate(file_path)
get_channels(file_path)
