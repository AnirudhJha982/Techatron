import json
import os
import time
from concurrent.futures import ThreadPoolExecutor

try:
    from googletrans import Translator
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "googletrans==4.0.0-rc1"])
    from googletrans import Translator

LANGUAGES = {
    'hi': 'hi',
    'as': 'as',
    'or': 'or',
    'mr': 'mr',
    'gu': 'gu',
    'pa': 'pa',
    'ta': 'ta',
    'te': 'te',
    'kn': 'kn',
    'ml': 'ml',
    'ur': 'ur',
    'sa': 'sa', # Sanskrit
    'mai': 'mai', # Maithili
    'sat': 'sat', # Santali (might not be supported, will fallback to en)
    'ks': 'sd', # Kashmiri (using sd as fallback if unsupported)
    'ne': 'ne',
    'kok': 'gom', # Konkani
    'sd': 'sd',
    'doi': 'doi', # Dogri
    'brx': 'en', # Bodo (unsupported, fallback to en)
    'mni': 'mni-Mtei', # Manipuri
}

translator = Translator()

def translate_text(text, dest):
    if dest == 'en' or not text:
        return text
    try:
        res = translator.translate(text, dest=dest)
        return res.text
    except Exception as e:
        print(f"Error translating to {dest}: {e}")
        return text

def merge_and_translate(en_data, lang_data, dest_lang):
    out = {}
    for k, v in en_data.items():
        if isinstance(v, dict):
            out[k] = merge_and_translate(v, lang_data.get(k, {}), dest_lang)
        else:
            if k in lang_data and lang_data[k]:
                out[k] = lang_data[k]
            else:
                out[k] = translate_text(v, dest_lang)
                time.sleep(0.5) # avoid rate limit
    return out

def process_file(lang):
    file_path = f"messages/{lang}.json"
    print(f"Processing {lang}...")
    
    with open("messages/en.json", "r", encoding="utf-8") as f:
        en_data = json.load(f)
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lang_data = json.load(f)
    except FileNotFoundError:
        lang_data = {}
        
    dest = LANGUAGES.get(lang, 'en')
    new_data = merge_and_translate(en_data, lang_data, dest)
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    print(f"Completed {lang}")

def main():
    print("Starting translation process...")
    for lang in LANGUAGES.keys():
        process_file(lang)

if __name__ == "__main__":
    main()
