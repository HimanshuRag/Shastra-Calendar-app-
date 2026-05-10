export interface HoroscopeData {
    sign: string;
    date_range: string;
    current_date: string;
    description: string;
    description_hi: string;
    compatibility: string;
    mood: string;
    mood_hi: string;
    color: string;
    color_hi: string;
    lucky_number: string;
    lucky_time: string;
}

export const ZODIACS = [
    { name: 'Aries', symbol: '♈' },
    { name: 'Taurus', symbol: '♉' },
    { name: 'Gemini', symbol: '♊' },
    { name: 'Cancer', symbol: '♋' },
    { name: 'Leo', symbol: '♌' },
    { name: 'Virgo', symbol: '♍' },
    { name: 'Libra', symbol: '♎' },
    { name: 'Scorpio', symbol: '♏' },
    { name: 'Sagittarius', symbol: '♐' },
    { name: 'Capricorn', symbol: '♑' },
    { name: 'Aquarius', symbol: '♒' },
    { name: 'Pisces', symbol: '♓' }
];

const DESCRIPTIONS_EN: Record<string, string> = {
    Aries: "The cosmic energy favors your fierce independence today. Channel this spark into a passion project, but remember to stay grounded. A surprising interaction will bring immense joy.",
    Taurus: "Venus is bathing you in comfort today. Focus on sensory pleasures and nurturing your loved ones. Stable, steady progress on your goals is guaranteed.",
    Gemini: "Your mind is a brilliant kaleidoscope of ideas. Express yourself freely, as your communication skills are unmatched right now. Someone needs your specific advice.",
    Cancer: "The moon draws your energy inward, bringing powerful intuition. Trust your gut feelings regarding a family matter. A peaceful evening will recharge your heart.",
    Leo: "Your natural radiance is amplified today! Step into the spotlight and share your warmth. Others are drawn to your confident, magnetic energy like a moth to a flame.",
    Virgo: "Meticulous energy supports your grandest plans. Organize your space and watch your mental clarity soar. A small detail you notice today will pay off massively tomorrow.",
    Libra: "Balance is your superpower. You'll find yourself effortlessly harmonizing conflicting situations around you. A beautiful aesthetic choice will brighten your mood.",
    Scorpio: "Deep, transformative currents are flowing through your day. Embrace vulnerability; it's your greatest strength right now. You are uncovering hidden truths that liberate you.",
    Sagittarius: "Adventure is calling, even in the mundane! Your optimistic outlook will turn a standard day into a joyful exploration. Seek out knowledge and share your laughter.",
    Capricorn: "Your ambitious spirit is recognized and rewarded today. Keep climbing your mountain with that trademark discipline. The foundation you lay today will stand the test of time.",
    Aquarius: "Innovative thoughts are sparking like electricity! You are ahead of the curve. Share your visionary ideas with your community, as they are ready to listen.",
    Pisces: "Your dreamy, compassionate nature is a healing balm to others today. Engage in creative pursuits or spiritual practices. The universe is whispering secrets to you."
};

const DESCRIPTIONS_HI: Record<string, string> = {
    Aries: "आज ब्रह्मांडीय ऊर्जा आपकी स्वतंत्रता का समर्थन करती है। इस चिंगारी को किसी रचनात्मक कार्य में लगाएं, लेकिन धरती पर टिके रहें। एक अप्रत्याशित मुलाकात आपको खुशी देगी।",
    Taurus: "शुक्र ग्रह आज आपको सुख-चैन से नहला रहा है। अपने प्रियजनों की देखभाल करें और इंद्रियों के सुख का आनंद लें। आपके लक्ष्यों में स्थिर प्रगति निश्चित है।",
    Gemini: "आपका मन विचारों का शानदार बहुरूपदर्शक है। स्वतंत्र रूप से अपने विचार व्यक्त करें, आपके संवाद कौशल अभी बेजोड़ हैं। किसी को आपकी विशेष सलाह की आवश्यकता है।",
    Cancer: "चंद्रमा आपकी ऊर्जा को अंदर की ओर खींचता है, शक्तिशाली अंतर्ज्ञान लाता है। पारिवारिक मामले में अपनी आंतरिक भावनाओं पर भरोसा करें। एक शांत शाम आपके हृदय को तरोताजा करेगी।",
    Leo: "आज आपकी प्राकृतिक चमक बढ़ी हुई है! मंच पर कदम रखें और अपनी गर्मजोशी साझा करें। लोग आपकी आत्मविश्वासपूर्ण, चुंबकीय ऊर्जा की ओर खिंचे चले आते हैं।",
    Virgo: "सावधानीपूर्ण ऊर्जा आपकी सबसे बड़ी योजनाओं का समर्थन करती है। अपना स्थान व्यवस्थित करें और मानसिक स्पष्टता को बढ़ते देखें। आज जो छोटा विवरण आप नोटिस करेंगे वह कल बड़ा फल देगा।",
    Libra: "संतुलन आपकी महाशक्ति है। आप अपने आसपास की विरोधाभासी स्थितियों को सहजता से सामंजस्य में ला पाएंगे। एक सुंदर सौंदर्य विकल्प आपका मूड उज्ज्वल करेगा।",
    Scorpio: "गहरी, परिवर्तनकारी धाराएं आपके दिन में बह रही हैं। कमजोरी को अपनाएं; यह अभी आपकी सबसे बड़ी ताकत है। आप छिपे सत्यों को उजागर कर रहे हैं जो आपको मुक्त करती हैं।",
    Sagittarius: "साहसिक कार्य बुला रहा है, रोजमर्रा की जिंदगी में भी! आपका आशावादी दृष्टिकोण एक सामान्य दिन को आनंदमय अन्वेषण में बदल देगा। ज्ञान खोजें और हंसी साझा करें।",
    Capricorn: "आज आपकी महत्वाकांक्षी भावना को मान्यता और पुरस्कार मिलेगा। अपनी विशिष्ट अनुशासन के साथ अपना पर्वत चढ़ते रहें। आज आप जो नींव रखेंगे वह समय की कसौटी पर खरी उतरेगी।",
    Aquarius: "नवीन विचार बिजली की तरह चमक रहे हैं! आप समय से आगे हैं। अपने दूरदर्शी विचारों को अपने समुदाय के साथ साझा करें, वे सुनने के लिए तैयार हैं।",
    Pisces: "आपका स्वप्निल, करुणामय स्वभाव आज दूसरों के लिए एक उपचार मरहम है। रचनात्मक गतिविधियों या आध्यात्मिक अभ्यासों में संलग्न हों। ब्रह्मांड आपको रहस्य फुसफुसा रहा है।"
};

const MOODS_EN = ["Radiant", "Calm", "Expressive", "Intuitive", "Confident", "Focused", "Harmonious", "Deep", "Joyful", "Ambitious", "Visionary", "Dreamy"];
const MOODS_HI = ["प्रकाशमान", "शांत", "अभिव्यक्त", "सहज ज्ञानी", "आत्मविश्वासी", "केंद्रित", "सामंजस्यपूर्ण", "गहन", "आनंदमय", "महत्वाकांक्षी", "दूरदर्शी", "स्वप्निल"];

const COLORS_EN = ["Saffron Red", "Emerald Green", "Sky Blue", "Pearl White", "Gold", "Navy", "Rose Pink", "Deep Burgundy", "Purple", "Charcoal", "Electric Blue", "Sea Green"];
const COLORS_HI = ["केसरी लाल", "पन्ना हरा", "आसमानी नीला", "मोती सफ़ेद", "सुनहरा", "नेवी", "गुलाबी", "गहरा बैंगनी", "बैंगनी", "धूसर", "इलेक्ट्रिक नीला", "समुद्री हरा"];

export async function fetchMockHoroscope(sign: string): Promise<HoroscopeData> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const rawIdx = ZODIACS.findIndex(z => z.name === sign);
    const idx = rawIdx === -1 ? 0 : rawIdx;

    // Seed by date so values stay consistent throughout the day
    const today = new Date();
    const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const moodIdx = (daySeed + idx * 3) % MOODS_EN.length;
    const colorIdx = (daySeed + idx * 7 + 2) % COLORS_EN.length;

    const validSign = ZODIACS[idx].name
    return {
        sign: validSign,
        date_range: "Various",
        current_date: today.toLocaleDateString(),
        description: DESCRIPTIONS_EN[validSign] || DESCRIPTIONS_EN['Aries'],
        description_hi: DESCRIPTIONS_HI[validSign] || DESCRIPTIONS_HI['Aries'],
        compatibility: ZODIACS[(idx + 4) % 12].name,
        mood: MOODS_EN[moodIdx],
        mood_hi: MOODS_HI[moodIdx],
        color: COLORS_EN[colorIdx],
        color_hi: COLORS_HI[colorIdx],
        lucky_number: String(((daySeed + idx) % 99) + 1),
        lucky_time: `${((daySeed + idx * 5) % 12) + 1}:00 ${(daySeed + idx) % 2 === 0 ? 'AM' : 'PM'}`
    };
}
