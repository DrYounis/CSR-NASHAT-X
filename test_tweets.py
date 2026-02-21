#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سكريبت اختبار شامل لجميع التغريدات
Comprehensive Testing Script for All Tweets
"""

import json
import sys

def load_content():
    """تحميل المحتوى من ملف JSON"""
    try:
        with open('content.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ خطأ: لم يتم العثور على ملف content.json")
        sys.exit(1)
    except json.JSONDecodeError:
        print("❌ خطأ: ملف content.json غير صالح")
        sys.exit(1)

def format_tweet(hadith_data, hashtags):
    """تنسيق التغريدة"""
    day = hadith_data['day']
    hadith = hadith_data['hadith']
    reference = hadith_data['reference']
    tip = hadith_data['tip']
    hashtags_str = ' '.join(hashtags)
    
    tweet = f"""🌙 اليوم {day} من #رمضان

📖 {hadith}
— {reference}

💪 نصيحة رياضية:
{tip}

{hashtags_str}"""
    
    return tweet

def test_all_tweets():
    """اختبار جميع التغريدات"""
    data = load_content()
    hadiths = data['hadiths']
    hashtags = data['settings']['hashtags']
    
    print("="*70)
    print("🧪 اختبار شامل لجميع التغريدات")
    print("="*70)
    print()
    
    total_tweets = len(hadiths)
    passed = 0
    failed = 0
    warnings = 0
    
    issues = []
    length_stats = []
    
    for hadith_data in hadiths:
        day = hadith_data['day']
        tweet = format_tweet(hadith_data, hashtags)
        tweet_length = len(tweet)
        length_stats.append(tweet_length)
        
        # التحقق من الطول
        status = ""
        if tweet_length > 280:
            status = "❌ فشل"
            failed += 1
            issues.append(f"اليوم {day}: {tweet_length} حرف (أطول من 280)")
        elif tweet_length > 270:
            status = "⚠️ تحذير"
            warnings += 1
            issues.append(f"اليوم {day}: {tweet_length} حرف (قريب من الحد)")
        else:
            status = "✅ نجح"
            passed += 1
        
        print(f"{status} | اليوم {day:2d} | {tweet_length:3d} حرف | {hadith_data['hadith'][:40]}...")
    
    print()
    print("="*70)
    print("📊 الإحصائيات:")
    print("="*70)
    print(f"✅ نجح:   {passed}/{total_tweets}")
    print(f"⚠️  تحذير: {warnings}/{total_tweets}")
    print(f"❌ فشل:   {failed}/{total_tweets}")
    print()
    print(f"📏 أطول تغريدة:  {max(length_stats)} حرف")
    print(f"📏 أقصر تغريدة:  {min(length_stats)} حرف")
    print(f"📏 متوسط الطول:  {sum(length_stats)//len(length_stats)} حرف")
    print()
    
    if issues:
        print("="*70)
        print("⚠️ المشاكل المكتشفة:")
        print("="*70)
        for issue in issues:
            print(f"  • {issue}")
        print()
    
    if failed > 0:
        print("="*70)
        print("❌ الاختبار فشل! يوجد تغريدات أطول من 280 حرف")
        print("="*70)
        return False
    elif warnings > 0:
        print("="*70)
        print("⚠️ الاختبار نجح مع تحذيرات")
        print("="*70)
        return True
    else:
        print("="*70)
        print("✅ الاختبار نجح! جميع التغريدات مناسبة")
        print("="*70)
        return True

def test_single_tweet(day):
    """اختبار تغريدة واحدة"""
    data = load_content()
    
    hadith_data = None
    for h in data['hadiths']:
        if h['day'] == day:
            hadith_data = h
            break
    
    if not hadith_data:
        print(f"❌ لم يتم العثور على محتوى لليوم {day}")
        return
    
    tweet = format_tweet(hadith_data, data['settings']['hashtags'])
    tweet_length = len(tweet)
    
    print("="*70)
    print(f"🧪 اختبار تغريدة اليوم {day}")
    print("="*70)
    print()
    print(tweet)
    print()
    print("="*70)
    print(f"📊 عدد الحروف: {tweet_length}")
    print(f"📊 المساحة المتبقية: {280 - tweet_length} حرف")
    
    if tweet_length > 280:
        print("❌ التغريدة أطول من الحد المسموح!")
    elif tweet_length > 270:
        print("⚠️ التغريدة قريبة من الحد (270-280)")
    else:
        print("✅ التغريدة مناسبة")
    print("="*70)

def show_menu():
    """عرض القائمة الرئيسية"""
    print("="*70)
    print("🧪 سكريبت اختبار التغريدات")
    print("="*70)
    print()
    print("الخيارات:")
    print("1. اختبار جميع التغريدات")
    print("2. اختبار تغريدة محددة")
    print("3. عرض إحصائيات المحتوى")
    print("0. خروج")
    print()

def show_content_stats():
    """عرض إحصائيات المحتوى"""
    data = load_content()
    
    print("="*70)
    print("📊 إحصائيات المحتوى")
    print("="*70)
    print()
    print(f"📖 عدد الأحاديث: {len(data['hadiths'])}")
    print(f"💪 عدد النصائح: {len(data['hadiths'])}")
    print(f"🏷️ الهاشتاغات: {', '.join(data['settings']['hashtags'])}")
    print(f"⏰ وقت النشر: {data['settings']['post_time']}")
    print(f"🌍 المنطقة الزمنية: {data['settings']['timezone']}")
    print(f"📅 بداية رمضان: {data['settings']['ramadan_start']}")
    print()
    
    # إحصائيات الأطوال
    hashtags = data['settings']['hashtags']
    lengths = []
    
    for hadith in data['hadiths']:
        tweet = format_tweet(hadith, hashtags)
        lengths.append(len(tweet))
    
    print("📏 إحصائيات الأطوال:")
    print(f"  • الأطول: {max(lengths)} حرف")
    print(f"  • الأقصر: {min(lengths)} حرف")
    print(f"  • المتوسط: {sum(lengths)//len(lengths)} حرف")
    print(f"  • النطاق: {min(lengths)}-{max(lengths)} حرف")
    print()
    
    # توزيع الأطوال
    ranges = {
        "200-220": 0,
        "220-240": 0,
        "240-260": 0,
        "260-280": 0,
        "280+": 0
    }
    
    for length in lengths:
        if length < 220:
            ranges["200-220"] += 1
        elif length < 240:
            ranges["220-240"] += 1
        elif length < 260:
            ranges["240-260"] += 1
        elif length <= 280:
            ranges["260-280"] += 1
        else:
            ranges["280+"] += 1
    
    print("📊 توزيع الأطوال:")
    for range_name, count in ranges.items():
        bar = "█" * count
        print(f"  {range_name}: {bar} ({count})")
    print("="*70)

def main():
    """الدالة الرئيسية"""
    while True:
        show_menu()
        
        try:
            choice = input("👉 اختر رقم الخيار: ").strip()
            
            if choice == '1':
                test_all_tweets()
            
            elif choice == '2':
                day = int(input("أدخل رقم اليوم (1-30): "))
                if 1 <= day <= 30:
                    test_single_tweet(day)
                else:
                    print("❌ رقم اليوم يجب أن يكون بين 1 و 30")
            
            elif choice == '3':
                show_content_stats()
            
            elif choice == '0':
                print("👋 مع السلامة!")
                break
            
            else:
                print("❌ خيار غير صحيح!")
            
            print()
            input("اضغط Enter للمتابعة...")
            print("\n" * 2)
        
        except KeyboardInterrupt:
            print("\n\n👋 تم إيقاف البرنامج")
            break
        except Exception as e:
            print(f"❌ خطأ: {str(e)}")

if __name__ == "__main__":
    main()
