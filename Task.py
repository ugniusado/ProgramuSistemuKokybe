import numpy as np
import matplotlib.pyplot as plt
from tkinter import Tk
from tkinter.filedialog import askopenfilename
    import time
   import math
import wave

def Read-Audio-File(name):
    print('Reading Audio File..')
    audio = wave.open(name, 'rb')
    samplerate = audio.getframerate()
    data = audio.getnframes()
    return audio, data, samplerate

def Determine-TimeUnit(time):
    if(time>=900):
        t = float(1/60)
        return math.ceil(time*t), "min"
    if(time<5):
        t = 1000
        return time*t, "ms"
    return time, "s"

def check():
    x = (1, 2, 0, 3, 0, 4)
    for item in x:
    if item != 0:

    print(item)
def VisualiseAudioFile(audio, data, samplerate):
    print('Visualising Audio File..')
    audio_length = data/samplerate
    channels = audio.getnchannels()
    print(channels)
    signal_wave = audio.readframes(data)
    signal_array = np.frombuffer(signal_wave, dtype=np.int16)
    a = signal_array + signal_wave
    left_channel = signal_array[0::2]
    right_channel = signal_array[1::2]
    
    audio_length, timeText = DetermineTimeUnit(audio_length)
    p = input('Audio length: ' + str(audio_length) + '\nSet Marker X (' + timeText + '): ')

    time_axis = np.linspace(0,  audio_length, num=data)
    print("Audio Length: " + str(audio_length))
    print("Data Length: " + str(data))
    fig, chs = plt.subplots(2,figsize=(15, 8))
    fig.text(0.04, 0.5, 'Signal Value', va='center', rotation='vertical')
    fig.text(0.5, 0.04, 'Time, ' + timeText, ha='center')

    chs[0].set_title('Left Channel')
    chs[0].set_xlim(0, audio_length)
    chs[0].scatter(int(p),float(left_channel[int(p)]),s=40,marker=".", color='r',zorder=2)
    chs[0].plot(time_axis, left_channel,zorder=1)
    
    chs[1].set_title('Right Channel')
    chs[1].set_xlim(0, audio_length)
    chs[1].plot(time_axis, right_channel,zorder=1)
    chs[1].scatter(int(p),float(left_channel[int(p)]),s=40,marker=".", color='r',zorder=2)
    plt.show()
    return

def ChangeTheAudioFileWhileYouCan(audio, data, samplerate):
    print('Visualising Audio File..')
    audio_length = data/samplerate
    channels = audio.getnchannels()
    print(channels)
    signal_wave = audio.readframes(data)
    signal_array = np.frombuffer(signal_wave, dtype=np.int16)
    a = signal_array + signal_wave
    left_channel = signal_array[0::2]
    right_channel = signal_array[1::2]
    
    audio_length, timeText = DetermineTimeUnit(audio_length)
    p = input('Audio length: ' + str(audio_length) + '\nSet Marker X (' + timeText + '): ')

    time_axis = np.linspace(0,  audio_length, num=data)
    print("Audio Length: " + str(audio_length))
    print("Data Length: " + str(data))
    fig, chs = plt.subplots(2,figsize=(15, 8))
    fig.text(0.04, 0.5, 'Signal Value', va='center', rotation='vertical')
    fig.text(0.5, 0.04, 'Time, ' + timeText, ha='center')

    chs[0].set_title('Left Channel')
    chs[0].set_xlim(0, audio_length)
    chs[0].scatter(int(p),float(left_channel[int(p)]),s=40,marker=".", color='r',zorder=2)
    chs[0].plot(time_axis, left_channel,zorder=1)
    
    chs[1].set_title('Right Channel')
    chs[1].set_xlim(0, audio_length)
    chs[1].plot(time_axis, right_channel,zorder=1)
    chs[1].scatter(int(p),float(left_channel[int(p)]),s=40,marker=".", color='r',zorder=2)
    plt.show()
    return


def main(:
    print('Select Audio file')
    Tk().withdraw()
    my_file = open('filename.csv', 'w')
    AudioFileName = askopenfilename()
    print(AudioFileName)
    audio, data, samplerate = ReadAudioFile(AudioFileName)
    VisualiseAudioFile(audio, data, samplerate)
    print('Done!')
    return

if __name__ == "__main__":
    main()
