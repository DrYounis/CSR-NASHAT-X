#!/bin/bash
# سكريبت النسخ الاحتياطي التلقائي
# Automatic Backup Script

echo "=================================="
echo "💾 سكريبت النسخ الاحتياطي"
echo "=================================="
echo ""

# التاريخ والوقت
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"
BACKUP_NAME="ramadan_bot_backup_${TIMESTAMP}"

# إنشاء مجلد النسخ الاحتياطية
mkdir -p "$BACKUP_DIR"

echo "📁 إنشاء نسخة احتياطية..."

# الملفات المهمة للنسخ الاحتياطي
FILES_TO_BACKUP=(
    "content.json"
    "posted_log.json"
    ".env"
    "ramadan_bot.py"
)

# إنشاء مجلد مؤقت
TEMP_DIR="${BACKUP_DIR}/${BACKUP_NAME}"
mkdir -p "$TEMP_DIR"

# نسخ الملفات
for file in "${FILES_TO_BACKUP[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$TEMP_DIR/"
        echo "  ✅ نسخ: $file"
    else
        echo "  ⚠️  غير موجود: $file"
    fi
done

# ضغط النسخة الاحتياطية
echo ""
echo "🗜️  ضغط النسخة الاحتياطية..."
cd "$BACKUP_DIR"
zip -r "${BACKUP_NAME}.zip" "$BACKUP_NAME" > /dev/null 2>&1
rm -rf "$BACKUP_NAME"
cd ..

BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.zip" | cut -f1)

echo ""
echo "=================================="
echo "✅ تمت النسخة الاحتياطية بنجاح!"
echo "=================================="
echo ""
echo "📦 الملف: ${BACKUP_DIR}/${BACKUP_NAME}.zip"
echo "📊 الحجم: ${BACKUP_SIZE}"
echo ""

# حذف النسخ القديمة (الاحتفاظ بآخر 5 نسخ)
echo "🗑️  حذف النسخ القديمة..."
cd "$BACKUP_DIR"
ls -t ramadan_bot_backup_*.zip | tail -n +6 | xargs -r rm
REMAINING=$(ls -1 ramadan_bot_backup_*.zip 2>/dev/null | wc -l)
cd ..

echo "📁 النسخ المحفوظة: $REMAINING"
echo ""
echo "=================================="
echo "💡 نصيحة: احفظ النسخة في مكان آمن!"
echo "=================================="
