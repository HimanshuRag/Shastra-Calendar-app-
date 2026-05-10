'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Language = 'en' | 'hi'

export interface AppContextProps {
    language: Language
    setLanguage: (lang: Language) => void
    lat: number
    lng: number
    setCoordinates: (lat: number, lng: number) => void
    t: (key: string) => string
}

const TRANSLATIONS: Record<string, Record<Language, string>> = {
    // App General
    'app.title': { en: 'Shastra Life', hi: 'शास्त्र लाइफ' },
    'app.subtitle': { en: 'Your Daily Vedic Companion', hi: 'आपका दैनिक वैदिक साथी' },
    'app.truth': { en: 'सत्यमेव जयते · Truth alone triumphs', hi: 'सत्यमेव जयते' },
    'app.disclaimer': { en: 'Vedic data is mathematically calculated algorithmically.', hi: 'वैदिक डेटा की गणना यंत्र द्वारा की गई है।' },

    // Sections
    'section.today': { en: '✦ Today ✦', hi: '✦ आज ✦' },
    'section.oracle': { en: '✦ Oracle ✦', hi: '✦ संदेश ✦' },

    // Location & Toggle
    'location.enable': { en: '◉ Enable Location', hi: '◉ स्थान सक्षम करें' },
    'location.blocked': { en: '◉ Location blocked', hi: '◉ स्थान अवरुद्ध' },
    'location.retry': { en: '◉ Retry', hi: '◉ पुनः प्रयास' },
    'location.your': { en: 'Your Location', hi: 'आपका स्थान' },

    // Calendar
    'calendar.title': { en: 'Hindu Panchang Calendar', hi: 'हिन्दू पंचांग कैलेंडर' },
    'calendar.not_available': { en: 'Panchang data not available for this date', hi: 'इस तिथि के लिए पंचांग उपलब्ध नहीं है' },
    'calendar.coming_soon': { en: 'Detailed Panchang for this date coming soon.', hi: 'इस तिथि का विस्तृत पंचांग जल्द आ रहा है।' },
    'calendar.fasting_day': { en: 'Fasting Day', hi: 'उपवास का दिन' },
    'calendar.fasting_desc': {
        en: 'Observe Ekadashi fast for spiritual merit. Break fast next day in the Parana window.',
        hi: 'एकादशी का व्रत रखें। पारण के समय पर अगले दिन व्रत खोलें।'
    },

    // Today Energy Card
    'energy.title': { en: "Today's Energy", hi: 'आज की ऊर्जा' },
    'energy.tithi': { en: 'Tithi', hi: 'तिथि' },
    'energy.nakshatra': { en: 'Nakshatra', hi: 'नक्षत्र' },
    'energy.sunrise': { en: 'Sunrise', hi: 'सूर्योदय' },
    'energy.sunset': { en: 'Sunset', hi: 'सूर्यास्त' },

    // Ekadashi Card
    'ekadashi.upcoming': { en: 'Upcoming Fast', hi: 'आगामी उपवास' },
    'ekadashi.parana': { en: 'Parana Window', hi: 'पारण का समय' },
    'ekadashi.break': { en: 'Break fast tomorrow during this exact window.', hi: 'कल इसी समय के दौरान अपना व्रत खोलें।' },

    // Days of Week / Paksha
    'dow.Sun': { en: 'Sun', hi: 'रवि' },
    'dow.Mon': { en: 'Mon', hi: 'सोम' },
    'dow.Tue': { en: 'Tue', hi: 'मंगल' },
    'dow.Wed': { en: 'Wed', hi: 'बुध' },
    'dow.Thu': { en: 'Thu', hi: 'गुरु' },
    'dow.Fri': { en: 'Fri', hi: 'शुक्र' },
    'dow.Sat': { en: 'Sat', hi: 'शनि' },
    'paksha.Shukla': { en: 'Shukla Paksha', hi: 'शुक्ल पक्ष' },
    'paksha.Krishna': { en: 'Krishna Paksha', hi: 'कृष्ण पक्ष' },

    // Month names (full)
    'month.January':   { en: 'January',   hi: 'जनवरी' },
    'month.February':  { en: 'February',  hi: 'फ़रवरी' },
    'month.March':     { en: 'March',     hi: 'मार्च' },
    'month.April':     { en: 'April',     hi: 'अप्रैल' },
    'month.May':       { en: 'May',       hi: 'मई' },
    'month.June':      { en: 'June',      hi: 'जून' },
    'month.July':      { en: 'July',      hi: 'जुलाई' },
    'month.August':    { en: 'August',    hi: 'अगस्त' },
    'month.September': { en: 'September', hi: 'सितंबर' },
    'month.October':   { en: 'October',   hi: 'अक्टूबर' },
    'month.November':  { en: 'November',  hi: 'नवंबर' },
    'month.December':  { en: 'December',  hi: 'दिसंबर' },

    // Month short names
    'month_short.Jan': { en: 'Jan', hi: 'जन' },
    'month_short.Feb': { en: 'Feb', hi: 'फ़र' },
    'month_short.Mar': { en: 'Mar', hi: 'मार्च' },
    'month_short.Apr': { en: 'Apr', hi: 'अप्रै' },
    'month_short.May': { en: 'May', hi: 'मई' },
    'month_short.Jun': { en: 'Jun', hi: 'जून' },
    'month_short.Jul': { en: 'Jul', hi: 'जुलाई' },
    'month_short.Aug': { en: 'Aug', hi: 'अग' },
    'month_short.Sep': { en: 'Sep', hi: 'सित' },
    'month_short.Oct': { en: 'Oct', hi: 'अक्टू' },
    'month_short.Nov': { en: 'Nov', hi: 'नव' },
    'month_short.Dec': { en: 'Dec', hi: 'दिस' },

    // Festival calendar extras
    'festival.today': { en: 'Today', hi: 'आज' },

    // Bottom Nav
    'nav.today':    { en: 'Today',    hi: 'आज' },
    'nav.calendar': { en: 'Calendar', hi: 'कैलेंडर' },
    'nav.oracle':   { en: 'Oracle',   hi: 'संदेश' },
    'nav.settings': { en: 'Settings', hi: 'सेटिंग्स' },

    // Today Energy Card
    'energy.tithi_ends': { en: 'Tithi ends at', hi: 'तिथि समाप्त' },
    'energy.karana':     { en: 'Karana:',       hi: 'करण:' },
    'energy.rahu_kaal':  { en: 'Rahu Kaal',     hi: 'राहु काल' },
    'energy.panchak':    { en: 'Panchak',        hi: 'पंचक' },
    'energy.panchak_warn': { en: 'Avoid new ventures', hi: 'नए कार्य वर्जित' },
    'energy.bhadra':     { en: 'Bhadra (Vishti)', hi: 'भद्रा (विष्टि)' },
    'energy.bhadra_warn': { en: 'Inauspicious period', hi: 'अशुभ काल' },

    // Ekadashi Card
    'ekadashi.label':        { en: 'Ekadashi',              hi: 'एकादशी' },
    'ekadashi.fast_begins':  { en: 'Fast Begins',           hi: 'उपवास शुरू' },
    'ekadashi.break_window': { en: 'Break fast in this window', hi: 'इस समय में व्रत खोलें' },

    // Muhurta Card
    'muhurta.all_day':  { en: 'All day',           hi: 'सारा दिन' },
    'muhurta.subtitle': { en: 'Auspicious Times', hi: 'शुभ मुहूर्त' },
    'muhurta.title':    { en: "Today's Muhurta",  hi: 'आज का मुहूर्त' },
    'muhurta.quote':    { en: 'Time governs all', hi: 'काल सबको नियंत्रित करता है' },

    // Daily Oracle
    'oracle.label':      { en: 'Daily Oracle',          hi: 'दैनिक संदेश' },
    'oracle.title':      { en: 'Your Message for Today', hi: 'आज का आपका संदेश' },
    'oracle.karma':      { en: "Today's Karma",          hi: 'आज का कर्म' },
    'oracle.tap_reveal': { en: 'Tap to Reveal',          hi: 'संदेश देखें' },
    'oracle.tap_return': { en: 'Tap to return ↩',        hi: 'वापस जाएं ↩' },

    // My Mantras shelf
    'mantras.title': { en: 'My Mantras',                          hi: 'मेरे मंत्र' },
    'mantras.saved': { en: 'saved',                               hi: 'संरक्षित' },
    'mantras.empty': { en: 'No saved mantras yet',                hi: 'कोई मंत्र नहीं' },
    'mantras.hint':  { en: 'Tap ♥ on the Oracle card to save',   hi: '♥ दबाएं और मंत्र सहेजें' },

    // Festival Calendar
    'festival.search':   { en: 'Search festivals...', hi: 'त्योहार खोजें...' },
    'festival.all':      { en: 'All',                 hi: 'सभी' },
    'festival.festival': { en: 'Festivals',            hi: 'त्योहार' },
    'festival.ekadashi': { en: 'Ekadashi',            hi: 'एकादशी' },
    'festival.purnima':  { en: 'Purnima',             hi: 'पूर्णिमा' },
    'festival.amavasya': { en: 'Amavasya',            hi: 'अमावस्या' },
    'festival.none':     { en: 'No festivals found',  hi: 'कोई त्योहार नहीं मिला' },
    'festival.upcoming':        { en: 'Upcoming Festivals', hi: 'आगामी त्योहार' },
    'festival.badge_fast':      { en: 'Fast',              hi: 'उपवास' },
    'festival.badge_full_moon': { en: 'Full Moon',         hi: 'पूर्णिमा' },
    'festival.badge_new_moon':  { en: 'New Moon',          hi: 'अमावस्या' },
    'festival.badge_festival':  { en: 'Festival',          hi: 'त्योहार' },

    // Calendar View
    'calendar.legend_purnima':  { en: 'Purnima',  hi: 'पूर्णिमा' },
    'calendar.legend_ekadashi': { en: 'Ekadashi', hi: 'एकादशी' },
    'calendar.legend_festival': { en: 'Festival', hi: 'त्योहार' },
    'calendar.legend_amavasya': { en: 'Amavasya', hi: 'अमावस्या' },
    'calendar.legend_panchak':  { en: 'Panchak',  hi: 'पंचक' },
    'calendar.paksha_vara':     { en: 'Paksha · Vara', hi: 'पक्ष · वार' },
    'calendar.panchak_this_month': { en: 'Panchak this month', hi: 'इस माह पंचक' },
    'calendar.panchak_detail':  { en: 'Avoid new ventures, travel south, cutting hair & nails', hi: 'नए कार्य, दक्षिण यात्रा, बाल-नाखून काटना वर्जित' },
    'calendar.bhadra_detail':   { en: 'Vishti Karana — inauspicious for new work & auspicious events', hi: 'विष्टि करण — नए कार्य व शुभ कार्यों के लिए अशुभ' },

    'settings.language_sub':  { en: 'भाषा / Language', hi: 'भाषा / Language' },

    // Settings
    'settings.appearance':    { en: 'Appearance',                  hi: 'दिखावट' },
    'settings.dark_mode':     { en: 'Dark Mode',                   hi: 'डार्क मोड' },
    'settings.dark_sub':      { en: 'Saffron night theme',         hi: 'केसरिया रात्रि थीम' },
    'settings.language':      { en: 'Language',                    hi: 'भाषा' },
    'settings.notif_section': { en: 'Morning Reminder',            hi: 'सुबह की याद' },
    'settings.notif_label':   { en: 'Daily Panchang Reminder',     hi: 'दैनिक पंचांग स्मरण' },
    'settings.notif_sub':     { en: "Get today's Tithi at sunrise", hi: 'सूर्योदय पर आज की तिथि पाएं' },
    'settings.notif_time':    { en: 'Reminder Time',               hi: 'स्मरण का समय' },
    'settings.deity_section': { en: 'Ishta Devata',                hi: 'इष्ट देवता' },
    'settings.zodiac_section':{ en: 'Your Zodiac Sign',            hi: 'आपकी राशि' },
    'settings.about':         { en: 'About',                       hi: 'बारे में' },
    'settings.version':       { en: 'Version',                     hi: 'संस्करण' },
    'settings.calculations':  { en: 'Calculations',                hi: 'गणना' },
    'settings.reset':         { en: 'Reset & Redo Onboarding',     hi: 'रीसेट करें' },
    'settings.reset_confirm': { en: 'Reset all preferences?',      hi: 'सभी प्राथमिकताएं रीसेट करें?' },
    'settings.cancel':        { en: 'Cancel',                      hi: 'रद्द करें' },
    'settings.reset_yes':     { en: 'Yes, Reset',                  hi: 'हाँ, रीसेट करें' },
    'settings.privacy_policy':{ en: 'Privacy Policy',              hi: 'गोपनीयता नीति' },
    'settings.view':          { en: 'View',                        hi: 'देखें' },

    // Header
    'header.streak_sub': { en: 'Open the app daily to grow your practice.', hi: 'अपनी साधना बढ़ाने के लिए रोज़ ऐप खोलें।' },
    'header.streak_days': { en: 'day streak', hi: 'दिन की लकीर' },
    
    // Dashboard
    'dashboard.practice': { en: 'YOUR PRACTICE', hi: 'आपकी साधना' },

    // Service Worker update banner
    'sw.update_title': { en: 'Update available',                     hi: 'अपडेट उपलब्ध है' },
    'sw.update_body':  { en: 'A new version of Shastra Life is ready.', hi: 'शास्त्र लाइफ का नया संस्करण तैयार है।' },
    'sw.update_btn':   { en: 'Update',                               hi: 'अपडेट करें' },

    // Offline page
    'offline.status':  { en: 'You are offline',                                                          hi: 'आप ऑफलाइन हैं' },
    'offline.message': { en: 'Please check your internet connection and try again. Previously viewed content is still available.', hi: 'कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें। पहले देखी गई सामग्री अभी भी उपलब्ध है।' },
    'offline.retry':   { en: 'Try Again',                                                                hi: 'पुनः प्रयास करें' },

    // Horoscope Section
    'horoscope.title': { en: 'Daily Horoscope', hi: 'दैनिक राशिफल' },
    'horoscope.daily_flow': { en: 'Daily Flow', hi: 'आज का प्रवाह' },
    'horoscope.boosters': { en: 'Daily Boosters', hi: 'आज के शुभ संकेत' },
    'horoscope.mood': { en: 'Mood', hi: 'मनोदशा' },
    'horoscope.color': { en: 'Color', hi: 'रंग' },
    'horoscope.lucky_time': { en: 'Lucky Time', hi: 'शुभ समय' },
    'horoscope.error': { en: 'Could not load horoscope. Please try again.', hi: 'राशिफल लोड नहीं हो सका। कृपया पुनः प्रयास करें।' },

    // ── Tithi names ──────────────────────────────────────────────────────────
    'tithi.Pratipada':   { en: 'Pratipada',   hi: 'प्रतिपदा' },
    'tithi.Dwitiya':     { en: 'Dwitiya',     hi: 'द्वितीया' },
    'tithi.Tritiya':     { en: 'Tritiya',     hi: 'तृतीया' },
    'tithi.Chaturthi':   { en: 'Chaturthi',   hi: 'चतुर्थी' },
    'tithi.Panchami':    { en: 'Panchami',    hi: 'पंचमी' },
    'tithi.Shashti':     { en: 'Shashti',     hi: 'षष्ठी' },
    'tithi.Saptami':     { en: 'Saptami',     hi: 'सप्तमी' },
    'tithi.Ashtami':     { en: 'Ashtami',     hi: 'अष्टमी' },
    'tithi.Navami':      { en: 'Navami',      hi: 'नवमी' },
    'tithi.Dashami':     { en: 'Dashami',     hi: 'दशमी' },
    'tithi.Ekadashi':    { en: 'Ekadashi',    hi: 'एकादशी' },
    'tithi.Dwadashi':    { en: 'Dwadashi',    hi: 'द्वादशी' },
    'tithi.Trayodashi':  { en: 'Trayodashi',  hi: 'त्रयोदशी' },
    'tithi.Chaturdashi': { en: 'Chaturdashi', hi: 'चतुर्दशी' },
    'tithi.Purnima':     { en: 'Purnima',     hi: 'पूर्णिमा' },
    'tithi.Amavasya':    { en: 'Amavasya',    hi: 'अमावस्या' },

    // ── Nakshatra names ───────────────────────────────────────────────────────
    'nakshatra.Ashwini':          { en: 'Ashwini',          hi: 'अश्विनी' },
    'nakshatra.Bharani':          { en: 'Bharani',          hi: 'भरणी' },
    'nakshatra.Krittika':         { en: 'Krittika',         hi: 'कृत्तिका' },
    'nakshatra.Rohini':           { en: 'Rohini',           hi: 'रोहिणी' },
    'nakshatra.Mrigashira':       { en: 'Mrigashira',       hi: 'मृगशिरा' },
    'nakshatra.Ardra':            { en: 'Ardra',            hi: 'आर्द्रा' },
    'nakshatra.Punarvasu':        { en: 'Punarvasu',        hi: 'पुनर्वसु' },
    'nakshatra.Pushya':           { en: 'Pushya',           hi: 'पुष्य' },
    'nakshatra.Ashlesha':         { en: 'Ashlesha',         hi: 'आश्लेषा' },
    'nakshatra.Magha':            { en: 'Magha',            hi: 'मघा' },
    'nakshatra.Purva Phalguni':   { en: 'Purva Phalguni',   hi: 'पूर्व फाल्गुनी' },
    'nakshatra.Uttara Phalguni':  { en: 'Uttara Phalguni',  hi: 'उत्तर फाल्गुनी' },
    'nakshatra.Hasta':            { en: 'Hasta',            hi: 'हस्त' },
    'nakshatra.Chitra':           { en: 'Chitra',           hi: 'चित्रा' },
    'nakshatra.Swati':            { en: 'Swati',            hi: 'स्वाती' },
    'nakshatra.Vishakha':         { en: 'Vishakha',         hi: 'विशाखा' },
    'nakshatra.Anuradha':         { en: 'Anuradha',         hi: 'अनुराधा' },
    'nakshatra.Jyeshtha':         { en: 'Jyeshtha',         hi: 'ज्येष्ठा' },
    'nakshatra.Mula':             { en: 'Mula',             hi: 'मूल' },
    'nakshatra.Purva Ashadha':    { en: 'Purva Ashadha',    hi: 'पूर्व आषाढ़' },
    'nakshatra.Uttara Ashadha':   { en: 'Uttara Ashadha',   hi: 'उत्तर आषाढ़' },
    'nakshatra.Shravana':         { en: 'Shravana',         hi: 'श्रवण' },
    'nakshatra.Dhanishtha':       { en: 'Dhanishtha',       hi: 'धनिष्ठा' },
    'nakshatra.Shatabhisha':      { en: 'Shatabhisha',      hi: 'शतभिषा' },
    'nakshatra.Purva Bhadra':     { en: 'Purva Bhadra',     hi: 'पूर्व भाद्रपद' },
    'nakshatra.Uttara Bhadra':    { en: 'Uttara Bhadra',    hi: 'उत्तर भाद्रपद' },
    'nakshatra.Revati':           { en: 'Revati',           hi: 'रेवती' },

    // ── Karana names ──────────────────────────────────────────────────────────
    'karana.Bava':         { en: 'Bava',         hi: 'बव' },
    'karana.Balava':       { en: 'Balava',       hi: 'बालव' },
    'karana.Kaulava':      { en: 'Kaulava',      hi: 'कौलव' },
    'karana.Taitila':      { en: 'Taitila',      hi: 'तैतिल' },
    'karana.Garaja':       { en: 'Garaja',       hi: 'गरज' },
    'karana.Vanija':       { en: 'Vanija',       hi: 'वणिज' },
    'karana.Vishti':       { en: 'Vishti',       hi: 'विष्टि' },
    'karana.Shakuni':      { en: 'Shakuni',      hi: 'शकुनि' },
    'karana.Chatushpada':  { en: 'Chatushpada',  hi: 'चतुष्पाद' },
    'karana.Nagava':       { en: 'Nagava',       hi: 'नागव' },
    'karana.Kimstughna':   { en: 'Kimstughna',   hi: 'किंस्तुघ्न' },

    // ── Vara (Sanskrit weekday) names ─────────────────────────────────────────
    'vara.Ravivara':    { en: 'Ravivara',    hi: 'रविवार' },
    'vara.Somavara':    { en: 'Somavara',    hi: 'सोमवार' },
    'vara.Mangalavara': { en: 'Mangalavara', hi: 'मंगलवार' },
    'vara.Budhavara':   { en: 'Budhavara',   hi: 'बुधवार' },
    'vara.Guruvara':    { en: 'Guruvara',    hi: 'गुरुवार' },
    'vara.Shukravara':  { en: 'Shukravara',  hi: 'शुक्रवार' },
    'vara.Shanivara':   { en: 'Shanivara',   hi: 'शनिवार' },

    // ── Muhurta names & activities ────────────────────────────────────────────
    'muhurta.brahma_name':       { en: 'Brahma Muhurta',                                  hi: 'ब्रह्म मुहूर्त' },
    'muhurta.brahma_act':        { en: 'Meditation, study, prayer, yoga',                 hi: 'ध्यान, अध्ययन, प्रार्थना, योग' },
    'muhurta.abhijit_name':      { en: 'Abhijit Muhurta',                                 hi: 'अभिजित मुहूर्त' },
    'muhurta.abhijit_act':       { en: 'New beginnings, important decisions, travel',     hi: 'नई शुरुआत, महत्वपूर्ण निर्णय, यात्रा' },
    'muhurta.surya_hora':        { en: 'Surya Hora',                                      hi: 'सूर्य होरा' },
    'muhurta.surya_act':         { en: 'Government work, authority, health',              hi: 'सरकारी कार्य, अधिकार, स्वास्थ्य' },
    'muhurta.chandra_hora':      { en: 'Chandra Hora',                                    hi: 'चंद्र होरा' },
    'muhurta.chandra_act':       { en: 'Travel, new relationships, creativity',           hi: 'यात्रा, नए संबंध, सृजन' },
    'muhurta.mangal_hora':       { en: 'Mangal Hora',                                     hi: 'मंगल होरा' },
    'muhurta.mangal_act':        { en: 'Sports, surgery, disputes — avoid new ventures',  hi: 'खेल, शल्य चिकित्सा — नए कार्य वर्जित' },
    'muhurta.budha_hora':        { en: 'Budha Hora',                                      hi: 'बुध होरा' },
    'muhurta.budha_act':         { en: 'Business, communication, education',              hi: 'व्यापार, संचार, शिक्षा' },
    'muhurta.guru_hora':         { en: 'Guru Hora',                                       hi: 'गुरु होरा' },
    'muhurta.guru_act':          { en: 'Spiritual activities, teaching, wealth',          hi: 'आध्यात्मिक कार्य, शिक्षण, धन लाभ' },
    'muhurta.shukra_hora':       { en: 'Shukra Hora',                                     hi: 'शुक्र होरा' },
    'muhurta.shukra_act':        { en: 'Marriage, arts, luxury purchases',                hi: 'विवाह, कला, विलासिता की खरीद' },
    'muhurta.shani_hora':        { en: 'Shani Hora',                                      hi: 'शनि होरा' },
    'muhurta.shani_act':         { en: 'Avoid new ventures — good for routine tasks',     hi: 'नए कार्य वर्जित — नियमित कार्य उचित' },
    'muhurta.pratipada_yoga':    { en: 'Pratipada Yoga',                                  hi: 'प्रतिपदा योग' },
    'muhurta.pratipada_act':     { en: 'New beginnings, starting projects',               hi: 'नई शुरुआत, परियोजना आरंभ' },
    'muhurta.panchami_yoga':     { en: 'Panchami Yoga',                                   hi: 'पंचमी योग' },
    'muhurta.panchami_act':      { en: 'Medicine, healing, charity',                      hi: 'औषधि, उपचार, दान' },
    'muhurta.ekadashi_yoga':     { en: 'Ekadashi Yoga',                                   hi: 'एकादशी योग' },
    'muhurta.ekadashi_act':      { en: 'Fasting, prayer, spiritual merit',                hi: 'उपवास, प्रार्थना, आध्यात्मिक पुण्य' },
    'muhurta.purnima_yoga':      { en: 'Purnima Yoga',                                    hi: 'पूर्णिमा योग' },
    'muhurta.purnima_act':       { en: 'Worship, full moon rituals, charity',             hi: 'पूजा, पूर्णिमा विधि, दान' },

    // Zodiac Signs
    'zodiac.Aries': { en: 'Aries', hi: 'मेष' },
    'zodiac.Taurus': { en: 'Taurus', hi: 'वृषभ' },
    'zodiac.Gemini': { en: 'Gemini', hi: 'मिथुन' },
    'zodiac.Cancer': { en: 'Cancer', hi: 'कर्क' },
    'zodiac.Leo': { en: 'Leo', hi: 'सिंह' },
    'zodiac.Virgo': { en: 'Virgo', hi: 'कन्या' },
    'zodiac.Libra': { en: 'Libra', hi: 'तुला' },
    'zodiac.Scorpio': { en: 'Scorpio', hi: 'वृश्चिक' },
    'zodiac.Sagittarius': { en: 'Sagittarius', hi: 'धनु' },
    'zodiac.Capricorn': { en: 'Capricorn', hi: 'मकर' },
    'zodiac.Aquarius': { en: 'Aquarius', hi: 'कुंभ' },
    'zodiac.Pisces': { en: 'Pisces', hi: 'मीन' },
}

const AppContext = createContext<AppContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en')
    const [lat, setLat] = useState<number>(28.6139) // Default: New Delhi
    const [lng, setLng] = useState<number>(77.2090)

    // Restore persisted language on mount
    React.useEffect(() => {
        try {
            const saved = localStorage.getItem('shastra-language') as Language | null
            if (saved === 'en' || saved === 'hi') setLanguageState(saved)

            // Restore last known coordinates (rounded to 2dp ~1km precision)
            const savedLat = parseFloat(localStorage.getItem('shastra-lat') || '')
            const savedLng = parseFloat(localStorage.getItem('shastra-lng') || '')
            if (isFinite(savedLat) && isFinite(savedLng) &&
                savedLat >= -90 && savedLat <= 90 &&
                savedLng >= -180 && savedLng <= 180) {
                setLat(savedLat)
                setLng(savedLng)
            }
        } catch {
            // localStorage unavailable (Private Browsing, WebView restrictions) — use defaults
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('shastra-language', lang)
    }

    const setCoordinates = (latitude: number, longitude: number) => {
        if (!isFinite(latitude) || latitude < -90 || latitude > 90) return
        if (!isFinite(longitude) || longitude < -180 || longitude > 180) return
        const roundedLat = Math.round(latitude * 100) / 100
        const roundedLng = Math.round(longitude * 100) / 100
        try {
            localStorage.setItem('shastra-lat', String(roundedLat))
            localStorage.setItem('shastra-lng', String(roundedLng))
        } catch { /* storage unavailable */ }
        setLat(roundedLat)
        setLng(roundedLng)
    }

    const t = (key: string): string => {
        return TRANSLATIONS[key]?.[language] ?? TRANSLATIONS[key]?.['en'] ?? key
    }

    return (
        <AppContext.Provider value={{ language, setLanguage, lat, lng, setCoordinates, t }}>
            {children}
        </AppContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
