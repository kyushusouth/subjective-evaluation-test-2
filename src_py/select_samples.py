from pathlib import Path
import polars as pl
import shutil


def main():
    data_dir = Path(
        "/Users/minami/dev/nextjs/subjective-evaluation-test-2/wav_files_orig/base_hubert"
    )
    save_dir = Path("/Users/minami/class/research/音響学会202409/speech_samples")

    df = pl.read_csv(
        "/Users/minami/dev/nextjs/subjective-evaluation-test-2/src_py/df_agg.csv"
    )

    for row in df.iter_rows(named=True):
        data_path = (
            data_dir
            / row["model_name"]
            / row["speaker_name"]
            / row["sample_name"]
            / f"{row['kind']}.wav"
        )
        save_path = (
            save_dir
            / row["speaker_name"]
            / row["sample_name"]
            / f"{row['model_id']}.wav"
        )
        save_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(str(data_path), str(save_path))


if __name__ == "__main__":
    main()
