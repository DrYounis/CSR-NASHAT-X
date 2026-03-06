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
import random

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

        # تحميل منشورات الرعاية
        self.sponsorship_file = 'sponsorship_tweets.json'
        self.sponsorship_tweets = self.load_sponsorship_tweets()

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

    def load_sponsorship_tweets(self):
        """تحميل منشورات الرعاية"""
        if os.path.exists(self.sponsorship_file):
            with open(self.sponsorship_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"sponsorship_tweets": [], "settings": {}}
    
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

        # Validate tweet length (Twitter limit: 280 characters)
        if len(tweet) > 280:
            print(f"⚠️ تحذير: التغريدة تتجاوز 280 حرف ({len(tweet)} حرف)")
            print("💡 سيتم تقصير النص تلقائياً")
            # Truncate while preserving the message
            max_length = 280
            if len(tweet) > max_length:
                tweet = tweet[:max_length-3] + "..."
        
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
        except tweepy.errors.TweepyException as e:
            # Handle specific Twitter API errors
            error_code = getattr(e, 'api_codes', [])
            if isinstance(error_code, list) and len(error_code) > 0:
                error_code = error_code[0]
            else:
                error_code = None
            
            if error_code == 187:  # Duplicate tweet
                print(f"⚠️ تحذير: هذه التغريدة مكررة")
                return False
            elif error_code == 188:  # Status too long
                print(f"❌ خطأ: التغريدة أطول من 280 حرف ({len(tweet_text)} حرف)")
                return False
            elif error_code == 326:  # Rate limited
                print(f"⏳ تم الوصول لحد النشر - حاول لاحقاً")
                return False
            elif error_code in [189, 323]:  # Invalid media/bad request
                print(f"❌ خطأ في صيغة التغريدة: {str(e)}")
                return False
            else:
                print(f"❌ خطأ في النشر: {str(e)}")
                return False
        except Exception as e:
            # Generic error - log without exposing sensitive details
            print(f"❌ حدث خطأ غير متوقع أثناء النشر")
            return False

    def post_custom_tweet(self, text):
        """نشر تغريدة مخصصة مباشرة"""
        # Validate input
        if not text or not isinstance(text, str):
            print("❌ خطأ: النص يجب أن يكون نصاً صالحاً")
            return False
        
        text = text.strip()
        
        if len(text) < 5:
            print("❌ خطأ: النص قصير جداً (الحد الأدنى 5 أحرف)")
            return False
        
        if len(text) > 280:
            print(f"❌ خطأ: النص طويل جداً ({len(text)} حرف، الحد الأقصى 280)")
            return False
        
        try:
            response = self.client.create_tweet(text=text)
            print(f"✅ تم نشر التغريدة المخصصة بنجاح!")
            print(f"🔗 ID: {response.data['id']}")
            return True
        except tweepy.errors.TweepyException as e:
            error_code = getattr(e, 'api_codes', [])
            if isinstance(error_code, list) and len(error_code) > 0:
                error_code = error_code[0]
            else:
                error_code = None
            
            if error_code == 187:
                print(f"⚠️ تحذير: هذه التغريدة مكررة")
                return False
            elif error_code == 188:
                print(f"❌ خطأ: التغريدة أطول من 280 حرف")
                return False
            elif error_code == 326:
                print(f"⏳ تم الوصول لحد النشر - حاول لاحقاً")
                return False
            else:
                print(f"❌ خطأ في النشر: {str(e)}")
                return False
        except Exception as e:
            print(f"❌ حدث خطأ غير متوقع أثناء النشر")
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

    def get_current_day_name(self):
        """الحصول على اسم اليوم الحالي"""
        tz = pytz.timezone(self.settings.get('timezone', 'Asia/Riyadh'))
        now = datetime.now(tz)
        return now.strftime('%A').lower()

    def post_sponsorship_tweet(self, dry_run=False):
        """نشر تغريدة رعاية أسبوعية"""
        tweets = self.sponsorship_tweets.get('sponsorship_tweets', [])
        
        if not tweets:
            print("⚠️ لا توجد منشورات رعاية متاحة")
            return False

        # اختيار تغريدة عشوائية
        tweet_data = random.choice(tweets)
        tweet_text = tweet_data['text']

        if dry_run:
            print("\n" + "="*50)
            print("🧪 وضع التجربة - منشور رعاية")
            print("="*50)
            print(tweet_text)
            print("="*50)
            print(f"📊 عدد الحروف: {len(tweet_text)}")
            return True

        try:
            response = self.client.create_tweet(text=tweet_text)
            print(f"✅ تم نشر منشور الرعاية بنجاح!")
            print(f"🔗 ID: {response.data['id']}")
            return True
        except tweepy.errors.TweepyException as e:
            error_code = getattr(e, 'api_codes', [])
            if isinstance(error_code, list) and len(error_code) > 0:
                error_code = error_code[0]
            else:
                error_code = None
            
            if error_code == 187:
                print(f"⚠️ تحذير: هذه التغريدة مكررة")
                return False
            else:
                print(f"❌ خطأ في النشر: {str(e)}")
                return False
        except Exception as e:
            print(f"❌ حدث خطأ غير متوقع أثناء النشر")
            return False

    def schedule_weekly_sponsorship(self):
        """جدولة نشر منشورات الرعاية الأسبوعية"""
        weekly_schedule = self.sponsorship_tweets.get('settings', {}).get('weekly_schedule', {})
        
        print(f"⏰ تم جدولة منشورات الرعاية الأسبوعية")
        print(f"🌍 المنطقة الزمنية: {self.settings.get('timezone', 'Asia/Riyadh')}")
        
        # جدولة المنشورات حسب الأيام
        day_map = {
            'monday': schedule.every().monday,
            'tuesday': schedule.every().tuesday,
            'wednesday': schedule.every().wednesday,
            'thursday': schedule.every().thursday,
            'friday': schedule.every().friday,
            'saturday': schedule.every().saturday,
            'sunday': schedule.every().sunday
        }
        
        for day, time_str in weekly_schedule.items():
            if day in day_map:
                day_map[day].at(time_str).do(self.post_sponsorship_tweet)
                print(f"  📅 {day}: {time_str}")
        
        print("\n🔄 البوت يعمل الآن... (اضغط Ctrl+C للإيقاف)\n")
        
        # الاستمرار في التشغيل
        while True:
            schedule.run_pending()
            time.sleep(60)
    
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
    parser.add_argument("--sponsorship", action="store_true", help="Post weekly sponsorship tweet")
    parser.add_argument("--schedule-sponsorship", action="store_true", help="Schedule weekly sponsorship posts")
    args = parser.parse_args()

    bot = RamadanSportsBot()

    if args.custom_text:
        print("=" * 60)
        print("🌙 نشر تغريدة مخصصة من الاستوديو")
        print("=" * 60)
        bot.post_custom_tweet(args.custom_text)
        return

    if args.sponsorship:
        print("=" * 60)
        print("💼 نشر منشور رعاية")
        print("=" * 60)
        bot.post_sponsorship_tweet(dry_run=False)
        return

    if args.auto:
        print("=" * 60)
        print("🌙 تشغيل النشر التلقائي - بوت الأحاديث الرياضية")
        print("=" * 60)
        bot.auto_post_today()
        return

    if args.schedule_sponsorship:
        print("=" * 60)
        print("💼 جدولة منشورات الرعاية الأسبوعية")
        print("=" * 60)
        bot.schedule_weekly_sponsorship()
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
    print("7. اختبار منشور رعاية")
    print("8. نشر منشور رعاية الآن")
    print("9. جدولة منشورات الرعاية الأسبوعية")
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

            elif choice == '7':
                bot.post_sponsorship_tweet(dry_run=True)

            elif choice == '8':
                bot.post_sponsorship_tweet(dry_run=False)

            elif choice == '9':
                bot.schedule_weekly_sponsorship()

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
