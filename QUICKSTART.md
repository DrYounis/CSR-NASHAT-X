# ⚡ دليل البدء السريع

**ابدأ في 5 دقائق فقط!**

---

## 🎯 الخطوات السريعة

### 1. التثبيت (دقيقة واحدة)

```bash
# فك الضغط
unzip ramadan_sports_bot.zip
cd ramadan_sports_bot

# تثبيت المكتبات
pip install -r requirements.txt
```

---

### 2. إعداد المفاتيح (3 دقائق)

**أ) احصل على مفاتيح X:**
1. اذهب إلى: https://developer.twitter.com/en/portal/dashboard
2. أنشئ Project + App
3. فعّل "Read and Write" permissions
4. احفظ المفاتيح الخمسة

**ب) ضع المفاتيح:**
```bash
# انسخ القالب
cp .env.example .env

# افتح .env وضع مفاتيحك
nano .env  # أو استخدم محرر نصوص
```

---

### 3. التشغيل (دقيقة واحدة)

```bash
python ramadan_bot.py
```

**اختر الخيار 1** لتجربة تغريدة بدون نشر

---

## 🧪 اختبار سريع

```bash
python ramadan_bot.py
# اختر: 1
# أدخل: 1
# ستظهر تغريدة اليوم الأول للمراجعة
```

---

## 🚀 النشر الفعلي

**بعد التأكد من التجربة:**

```bash
python ramadan_bot.py
# اختر: 4 (للتشغيل التلقائي)
```

---

## ⚙️ إعدادات سريعة

**عدّل `content.json` حسب الحاجة:**

```json
{
  "settings": {
    "post_time": "21:00",           // وقت النشر
    "timezone": "Asia/Riyadh",      // منطقتك الزمنية
    "ramadan_start": "2025-03-01"   // تاريخ رمضان
  }
}
```

---

## 📋 المناطق الزمنية الشائعة

```
آسيا:
- السعودية: Asia/Riyadh
- الإمارات: Asia/Dubai
- مصر: Africa/Cairo
- السودان: Africa/Khartoum
- المغرب: Africa/Casablanca
- الجزائر: Africa/Algiers
- تونس: Africa/Tunis

أوروبا:
- بريطانيا: Europe/London
- ألمانيا: Europe/Berlin
- فرنسا: Europe/Paris

أمريكا:
- نيويورك: America/New_York
- لوس أنجلوس: America/Los_Angeles
```

---

## ✅ قائمة التحقق

- [ ] ثبّت Python
- [ ] ثبّت المكتبات (`pip install -r requirements.txt`)
- [ ] حصلت على مفاتيح X API
- [ ] أنشأت ملف `.env`
- [ ] وضعت المفاتيح في `.env`
- [ ] عدّلت تاريخ رمضان في `content.json`
- [ ] عدّلت المنطقة الزمنية
- [ ] جربت الخيار 1 (تجربة)
- [ ] جاهز للنشر! 🎉

---

## 🆘 مشكلة؟

**الخطأ:** `ModuleNotFoundError`
```bash
pip install -r requirements.txt
```

**الخطأ:** `401 Unauthorized`
- تحقق من مفاتيح `.env`
- تأكد من نسخها كاملة

**الخطأ:** `403 Forbidden`
- فعّل "Read and Write" في Developer Portal
- أعد إنشاء Access Token

---

## 📖 للمزيد

راجع `README.md` للدليل الكامل
راجع `API_KEYS_GUIDE.md` لشرح مفصّل للمفاتيح

---

**رمضان كريم!** 🌙
