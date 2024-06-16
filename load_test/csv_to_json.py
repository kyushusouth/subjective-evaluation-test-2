import csv
import json
import os


def get_env_variable(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        raise EnvironmentError(f"Environment variable '{var_name}' is not set.")
    return value


def read_csv(file_path: str) -> list:
    try:
        with open(file_path, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            return [row for row in reader]
    except FileNotFoundError:
        raise FileNotFoundError(f"CSV file '{file_path}' not found.")
    except Exception as e:
        raise RuntimeError(f"Error reading CSV file '{file_path}': {e}")


def write_json(data: list, file_path: str):
    try:
        with open(file_path, "w") as jsonfile:
            json.dump(data, jsonfile, indent=4)
    except Exception as e:
        raise RuntimeError(f"Error writing JSON file '{file_path}': {e}")


def main():
    try:
        csv_file_path = get_env_variable("LOCAL_AUTH_SAVE_PATH")
        json_file_path = "./auth.json"

        data = read_csv(csv_file_path)
        write_json(data, json_file_path)

        print(
            f"Data successfully converted from '{csv_file_path}' to '{json_file_path}'."
        )

    except EnvironmentError as e:
        print(f"Environment Error: {e}")
    except FileNotFoundError as e:
        print(f"File Not Found Error: {e}")
    except RuntimeError as e:
        print(f"Runtime Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
