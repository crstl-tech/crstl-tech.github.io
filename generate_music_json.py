import os
import json
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC, TIT2, TPE1, TALB

music_folder = "music"
output_file = "music.json"
music_data = {}

for filename in os.listdir(music_folder):
    if filename.lower().endswith(".mp3"):
        filepath = os.path.join(music_folder, filename)
        audio = MP3(filepath, ID3=ID3)
        tags = audio.tags

        title = str(tags.get("TIT2", filename))
        artist = str(tags.get("TPE1", "Unknown Artist"))
        album = str(tags.get("TALB", "Unknown Album"))

        # Генерация безопасного имени обложки
        safe_album_name = "".join(c if c.isalnum() or c in " _-" else "_" for c in album)
        cover_filename = f"{safe_album_name}.jpg"
        cover_path = os.path.join(music_folder, cover_filename)

        if not os.path.exists(cover_path):
            for tag in tags.values():
                if isinstance(tag, APIC):
                    with open(cover_path, "wb") as img:
                        img.write(tag.data)
                    break

        if album not in music_data:
            music_data[album] = {
                "cover": cover_filename if os.path.exists(cover_path) else None,
                "tracks": []
            }
        music_data[album]["tracks"].append({
            "artist": artist,
            "title": title,
            "url": f"{music_folder}/{filename}"
        })

# Преобразуем в список
output_list = []
for album_name, album_info in music_data.items():
    for track in album_info["tracks"]:
        output_list.append({
            "artist": track["artist"],
            "album": album_name,
            "title": track["title"],
            "url": track["url"],
            "cover": f"{music_folder}/{album_info['cover']}" if album_info['cover'] else None
        })

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(output_list, f, ensure_ascii=False, indent=4)

print(f"{output_file} создан, обложки сохранены в {music_folder}/")
