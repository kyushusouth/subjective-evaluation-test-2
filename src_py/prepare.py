from pathlib import Path


def main():
    audio_dir = Path("/Users/minami/dev/python/test-app-django/wav_files")
    audio_path_list = list(audio_dir.glob("**/*.wav"))
    breakpoint()


if __name__ == "__main__":
    main()
