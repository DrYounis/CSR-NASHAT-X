#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
بوت النشر التلقائي للأحاديث الرياضية في رمضان
Ramadan Sports Hadiths Bot for X (Twitter)
"""

import tweepy
import json
import os
import schedule
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
import pytz

# تحميل المتغيرات البيئية
load_dotenv()

class RamadanSportsBot:
    def __init__(self):
        """تهيئة البوت وتحميل البيانات"""
        # تحميل المحتوى
        with open('content.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.hadiths = data['hadiths']
            self.settings = data['settings']
        
        # تهيئة Twitter API v2
        self.client = tweepy.Client(
            bearer_token=os.getenv('BEARER_TOKEN'),
            consumer_key=os.getenv('API_KEY'),
            consumer_secret=os.getenv('API_SECRET'),
            access_token=os.getenv('ACCESS_TOKEN'),
            access_token_secret=os.getenv('ACCESS_TOKEN_SECRET')
        )
        
        # تحميل سجل المنشورات
        self.log_file = 'posted_log.json'
        self.posted_days = self.load_posted_log()
    
    def load_posted_log(self):
        """تحميل سجل الأيام التي تم نشرها"""
        if os.path.exists(self.log_file):
            with open(self.log_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def save_posted_log(self, day):
        """حفظ اليوم في سجل المنشورات"""
        if day not in self.posted_days:
            self.posted_days.append(day)
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(self.posted_days, f, ensure_ascii=False, indent=2)
    
    def get_ramadan_day(self):
        """حساب يوم رمضان الحالي"""
        tz = pytz.timezone(self.settings['timezone'])
        now = datetime.now(tz)
        ramadan_start = datetime.strptime(self.settings['ramadan_start'], '%Y-%m-%d')
        ramadan_start = tz.localize(ramadan_start)
        
        if now < ramadan_start:
            return 0  # لم يبدأ رمضان بعد
        
        days_diff = (now.date() - ramadan_start.date()).days + 1
        
        if days_diff > 30:
            return -1  # انتهى رمضان
        
        return days_diff
    
    def format_tweet(self, hadith_data):
        """تنسيق التغريدة"""
        day = hadith_data['day']
        hadith = hadith_data['hadith']
        reference = hadith_data['reference']
        tip = hadith_data['tip']
        hashtags = ' '.join(self.settings['hashtags'])
        
        tweet = f"""🌙 اليوم {day} من #رمضان

📖 {hadith}
— {reference}

💪 نصيحة رياضية:
{tip}

{hashtags}"""
        
        return tweet
    
    def post_tweet(self, day, dry_run=False):
        """نشر التغريدة لليوم المحدد"""
        # البحث عن الحديث المناسب
        hadith_data = None
        for h in self.hadiths:
            if h['day'] == day:
                hadith_data = h
                break
        
        if not hadith_data:
            print(f"❌ لم يتم العثور على محتوى لليوم {day}")
            return False
        
        tweet_text = self.format_tweet(hadith_data)
        
        if dry_run:
            print("\n" + "="*50)
            print("🧪 وضع التجربة (لن يتم النشر الفعلي)")
            print("="*50)
            print(tweet_text)
            print("="*50)
            print(f"📊 عدد الحروف: {len(tweet_text)}")
            return True
        
        try:
            response = self.client.create_tweet(text=tweet_text)
            print(f"✅ تم نشر تغريدة اليوم {day} بنجاح!")
            print(f"🔗 ID: {response.data['id']}")
            self.save_posted_log(day)
            return True
        except Exception as e:
            print(f"❌ خطأ في النشر: {str(e)}")
            return False
    
    def post_custom_tweet(self, text):
        """نشر تغريدة مخصصة مباشرة"""
        try:
            response = self.client.create_tweet(text=text)
            print(f"✅ تم نشر التغريدة المخصصة بنجاح!")
            print(f"🔗 ID: {response.data['id']}")
            return True
        except Exception as e:
            print(f"❌ خطأ في النشر: {str(e)}")
            return False

    def auto_post_today(self):
        """نشر تغريدة اليوم تلقائياً"""
        day = self.get_ramadan_day()
        
        if day == 0:
            print("⏳ رمضان لم يبدأ بعد")
            return
        elif day == -1:
            print("🎉 انتهى شهر رمضان المبارك")
            return
        
        print(f"📅 اليوم {day} من رمضان")
        self.post_tweet(day, dry_run=False)
    
    def schedule_daily_post(self):
        """جدولة النشر اليومي"""
        post_time = self.settings['post_time']
        schedule.every().day.at(post_time).do(self.auto_post_today)
        
        print(f"⏰ تم جدولة النشر اليومي في الساعة {post_time}")
        print(f"🌍 المنطقة الزمنية: {self.settings['timezone']}")
        print("🔄 البوت يعمل الآن... (اضغط Ctrl+C للإيقاف)\n")
        
        # تشغيل أول مرة فوراً
        self.auto_post_today()
        
        # الاستمرار في التشغيل
        while True:
            schedule.run_pending()
            time.sleep(60)  # فحص كل دقيقة

import argparse

def main():
    """القائمة الرئيسية أو التشغيل التلقائي"""
    parser = argparse.ArgumentParser(description="Ramadan Sports Hadiths Bot for X")
    parser.add_argument("--auto", action="store_true", help="Run daily post automatically without interactive menu")
    parser.add_argument("--custom-text", type=str, help="Post a custom tweet text directly")
    args = parser.parse_args()

    bot = RamadanSportsBot()

    if args.custom_text:
        print("=" * 60)
        print("🌙 نشر تغريدة مخصصة من الاستوديو")
        print("=" * 60)
        bot.post_custom_tweet(args.custom_text)
        return

    if args.auto:
        print("=" * 60)
        print("🌙 تشغيل النشر التلقائي - بوت الأحاديث الرياضية")
        print("=" * 60)
        bot.auto_post_today()
        return

    print("=" * 60)
    print("🌙 بوت الأحاديث الرياضية في رمضان")
    print("=" * 60)
    
    print("\n📋 الخيارات المتاحة:")
    print("1. اختبار تغريدة (بدون نشر فعلي)")
    print("2. نشر تغريدة اليوم")
    print("3. نشر تغريدة يوم محدد")
    print("4. تشغيل النشر التلقائي اليومي")
    print("5. عرض حالة رمضان")
    print("6. إعادة ضبط سجل المنشورات")
    print("0. خروج")
    
    while True:
        try:
            choice = input("\n👉 اختر رقم الخيار: ").strip()
            
            if choice == '1':
                day = int(input("أدخل رقم اليوم (1-30): "))
                bot.post_tweet(day, dry_run=True)
            
            elif choice == '2':
                bot.auto_post_today()
            
            elif choice == '3':
                day = int(input("أدخل رقم اليوم (1-30): "))
                confirm = input(f"هل أنت متأكد من نشر اليوم {day}؟ (y/n): ")
                if confirm.lower() == 'y':
                    bot.post_tweet(day, dry_run=False)
            
            elif choice == '4':
                bot.schedule_daily_post()
            
            elif choice == '5':
                day = bot.get_ramadan_day()
                print(f"\n📅 اليوم الحالي من رمضان: {day}")
                print(f"✅ الأيام المنشورة: {len(bot.posted_days)}")
                print(f"📝 الأيام: {bot.posted_days}")
            
            elif choice == '6':
                confirm = input("⚠️ هل أنت متأكد من حذف سجل المنشورات؟ (y/n): ")
                if confirm.lower() == 'y':
                    bot.posted_days = []
                    bot.save_posted_log(0)
                    print("✅ تم إعادة ضبط السجل")
            
            elif choice == '0':
                print("👋 مع السلامة!")
                break
            
            else:
                print("❌ خيار غير صحيح!")
        
        except KeyboardInterrupt:
            print("\n\n👋 تم إيقاف البوت")
            break
        except Exception as e:
            print(f"❌ خطأ: {str(e)}")

if __name__ == "__main__":
    main()
