#!/bin/bash

echo "=================================="
echo "🌙 Ramadan Sports Bot - Setup"
echo "=================================="
echo ""

# التحقق من Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 غير مثبت!"
    echo "ثبّت Python 3 أولاً: sudo apt install python3 python3-pip python3-venv"
    exit 1
fi

echo "✅ Python 3 موجود"

# إنشاء بيئة افتراضية
echo "📦 إنشاء بيئة افتراضية..."
python3 -m venv venv

# تفعيل البيئة
echo "🔧 تفعيل البيئة..."
source venv/bin/activate

# تثبيت المكتبات
echo "📥 تثبيت المكتبات..."
pip install --upgrade pip
pip install -r requirements.txt

# إنشاء ملف .env
if [ ! -f .env ]; then
    echo "📝 إنشاء ملف .env..."
    cp .env.example .env
    echo "⚠️  لا تنسَ تعديل ملف .env ووضع مفاتيحك!"
else
    echo "✅ ملف .env موجود مسبقاً"
fi

echo ""
echo "=================================="
echo "✅ التثبيت اكتمل بنجاح!"
echo "=================================="
echo ""
echo "الخطوات التالية:"
echo "1. عدّل ملف .env وضع مفاتيح X API"
echo "2. عدّل content.json (التاريخ والمنطقة الزمنية)"
echo "3. شغّل البوت: python ramadan_bot.py"
echo ""
echo "🌙 رمضان كريم!"
