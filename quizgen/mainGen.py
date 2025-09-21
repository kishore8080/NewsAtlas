import sys
import os
import subprocess

# Base directory where your scripts are located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Path to the current Python executable (venv/bin/python or venv/Scripts/python.exe)
python_exec = sys.executable

# List of scripts to run in order
scripts = [
    "FetchAPI.py",
    "MCQGen.py",
    "UPSCMCQGen.py"
]

def run_scripts():
    for script in scripts:
        script_path = os.path.join(BASE_DIR, script)
        print(f"Running {script} ...")
        try:
            subprocess.run([python_exec, script_path], check=True)
            print(f"{script} completed successfully\n")
        except subprocess.CalledProcessError as e:
            print(f"Error running {script}: {e}\n")
            break  # Stop if one script fails

if __name__ == "__main__":
    run_scripts()
