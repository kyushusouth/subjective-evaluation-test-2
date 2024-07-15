import os

import librosa
from gtts import gTTS
from scipy.io.wavfile import write


def main():
    text_dict = {
        "2_1": "これはダミー音声です。明瞭性は、「2:悪い」を、自然性は、「1:非常に悪い」を選択してください。",
        "1_3": "これはダミー音声です。明瞭性は、「1:非常に悪い」を、自然性は、「3:普通」を選択してください。",
        "4_2": "これはダミー音声です。明瞭性は、「4:良い」を、自然性は、「2:悪い」を選択してください。",
    }
    save_dir = os.environ.get("LOCAL_WAV_DIR_DUMMY")

    sr = 16000
    for i, (file_name, text) in enumerate(text_dict.items()):
        if i == 0:
            save_dir_ = save_dir / "eval_practice"
        else:
            save_dir_ = save_dir / "eval_1"
        save_dir_.mkdir(parents=True, exist_ok=True)
        tts = gTTS(text=text, lang="ja")
        tts.save(str(save_dir_ / f"{file_name}.mp3"))
        wav, _ = librosa.load(str(save_dir_ / f"{file_name}.mp3"), sr=sr)
        write(filename=str(save_dir_ / f"{file_name}.wav"), rate=sr, data=wav)
        os.remove(str(save_dir_ / f"{file_name}.mp3"))


if __name__ == "__main__":
    main()
