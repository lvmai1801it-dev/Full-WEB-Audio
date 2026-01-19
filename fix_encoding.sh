#!/bin/bash
# Re-import database with correct UTF-8 encoding
sudo docker exec audio_mysql mysql -u root -proot123 -e "DROP DATABASE IF EXISTS audio_truyen; CREATE DATABASE audio_truyen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo docker exec -i audio_mysql mysql -u root -proot123 --default-character-set=utf8mb4 audio_truyen < /mnt/d/WebAudio/database/schema.sql
sudo docker exec -i audio_mysql mysql -u root -proot123 --default-character-set=utf8mb4 audio_truyen < /mnt/d/WebAudio/database/sample_data.sql
echo "Done! Database re-imported with UTF-8 encoding."
