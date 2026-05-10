// Vedic Calendar Data Layer
// All calculations use the astronomy-engine — no hardcoded date ranges.

import { getDayData } from '@/lib/vedic-calendar'

export interface VedicDay {
    tithi: {
        name: string;
        number: number;
        paksha: 'Shukla' | 'Krishna';
        endTime: string;
    };
    sunrise: string;
    sunset: string;
    nakshatra: string;
    vara: string;
    rahuKaal: { start: string; end: string };
    isPanchak: boolean;
    isBhadra: boolean;
    karana: string;
}

export interface EkadashiData {
    name: string;
    date: string;
    fastStart: string;
    fastEnd: string;
    paranaStart: string;
    paranaEnd: string;
    paranaDate: string;
    significance: string;
    // Raw dates for language-aware formatting in components
    ekadashiDateObj: Date;
    paranaDateObj: Date;
    sunriseStr: string;
}

/**
 * Ekadashi names keyed by Gregorian month + paksha.
 * NOTE: This is an approximation — Vedic Ekadashi names follow the lunar month
 * (Chaitra, Vaishakha, etc.), not the Gregorian calendar. The Gregorian month
 * used here will be correct for ~80% of occurrences. A full implementation
 * would compute the Vedic lunar month from the solar longitude at new moon.
 *
 * Corrected Shukla/Krishna assignments (H-10 fix):
 * - Shukla Ekadashi = 11th tithi of the waxing fortnight
 * - Krishna Ekadashi = 11th tithi of the waning fortnight
 */
const EKADASHI_NAMES: Record<string, string> = {
    // Pausha / January
    '1-Shukla':  'Pausha Putrada Ekadashi',
    '1-Krishna': 'Shattila Ekadashi',
    // Magha / February
    '2-Shukla':  'Jaya Ekadashi',
    '2-Krishna': 'Vijaya Ekadashi',
    // Phalguna / March
    '3-Shukla':  'Amalaki Ekadashi',
    '3-Krishna': 'Papmochani Ekadashi',
    // Chaitra / April
    '4-Shukla':  'Kamada Ekadashi',
    '4-Krishna': 'Varuthini Ekadashi',
    // Vaishakha / May
    '5-Shukla':  'Mohini Ekadashi',
    '5-Krishna': 'Apara Ekadashi',
    // Jyeshtha / June
    '6-Shukla':  'Nirjala Ekadashi',
    '6-Krishna': 'Yogini Ekadashi',
    // Ashadha / July
    '7-Shukla':  'Devshayani Ekadashi',
    '7-Krishna': 'Kamika Ekadashi',
    // Shravana / August
    '8-Shukla':  'Shravana Putrada Ekadashi',
    '8-Krishna': 'Aja Ekadashi',
    // Bhadrapada / September
    '9-Shukla':  'Parsva Ekadashi',
    '9-Krishna': 'Indira Ekadashi',
    // Ashwin / October
    '10-Shukla': 'Papankusha Ekadashi',
    '10-Krishna': 'Rama Ekadashi',
    // Kartika / November
    '11-Shukla': 'Devutthana Ekadashi',
    '11-Krishna': 'Utpanna Ekadashi',
    // Margashirsha / December
    '12-Shukla': 'Mokshada Ekadashi',
    '12-Krishna': 'Saphala Ekadashi',
};

function fmtTime(d?: Date): string {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '--'
    try {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })
    } catch {
        try {
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        } catch {
            return '--'
        }
    }
}

/**
 * Rahu Kaal segment per weekday — traditional mnemonic
 * "Mother Saw Father Wearing The Turban Systematically"
 * Sun=5, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3 (1-indexed segments)
 * H-09 fix: Sunday was incorrectly set to 8 (end of day); correct value is 5
 */
const RAHU_KAAL_SEGMENT: Record<number, number> = {
    0: 5, // Sunday   — ~1:30 PM to 3:00 PM
    1: 2, // Monday   — ~7:30 AM to 9:00 AM
    2: 7, // Tuesday  — ~3:00 PM to 4:30 PM
    3: 5, // Wednesday — ~12:00 PM to 1:30 PM
    4: 6, // Thursday — ~1:30 PM to 3:00 PM (some traditions: 6)
    5: 4, // Friday   — ~10:30 AM to 12:00 PM
    6: 3, // Saturday — ~9:00 AM to 10:30 AM
};

function getRahuKaal(sunrise: Date | undefined, sunset: Date | undefined, weekday: number): { start: string; end: string } {
    if (!sunrise || !sunset) return { start: '--', end: '--' };
    const dayMs = sunset.getTime() - sunrise.getTime();
    if (dayMs <= 0) return { start: '--', end: '--' }; // guard: extreme latitude edge case
    const segmentMs = dayMs / 8;
    const segIdx = RAHU_KAAL_SEGMENT[weekday] - 1; // 0-indexed
    const start = new Date(sunrise.getTime() + segIdx * segmentMs);
    const end = new Date(start.getTime() + segmentMs);
    return { start: fmtTime(start), end: fmtTime(end) };
}

/**
 * Returns today's Vedic day data formatted for the TodayEnergyCard component.
 * Accepts optional lat/lng — defaults to New Delhi if user denies geolocation.
 * BUG-05 fix: single Date object used for both getDayData and weekday extraction.
 */
export function getMockVedicDay(lat = 28.6139, lng = 77.2090): VedicDay {
    try {
        const now = new Date(); // single reference — avoids midnight race condition
        const data = getDayData(now, lat, lng);
        const weekday = now.getDay();

        return {
            tithi: {
                name: data?.tithi || 'Pratipada',
                number: data?.tithiNumber || 1,
                paksha: data?.paksha || 'Shukla',
                endTime: fmtTime(data?.tithiEndTime),
            },
            sunrise: fmtTime(data?.sunrise),
            sunset: fmtTime(data?.sunset),
            nakshatra: data?.nakshatra || 'Ashwini',
            vara: data?.vara || 'Somavara',
            rahuKaal: getRahuKaal(data?.sunrise, data?.sunset, weekday),
            isPanchak: data?.isPanchak || false,
            isBhadra: data?.isBhadra || false,
            karana: data?.karana || 'Bava',
        };
    } catch {
        return {
            tithi: {
                name: 'Unavailable',
                number: 0,
                paksha: 'Shukla',
                endTime: '--',
            },
            sunrise: '--',
            sunset: '--',
            nakshatra: 'Unavailable',
            vara: 'Unavailable',
            rahuKaal: { start: '--', end: '--' },
            isPanchak: false,
            isBhadra: false,
            karana: 'Unavailable',
        };
    }
}

/**
 * Scans forward from today to find the next Ekadashi date using live astronomy.
 * Search window extended to 40 days (Ekadashi occurs every ~15 days).
 */
export function getNextEkadashi(lat = 28.6139, lng = 77.2090): EkadashiData {
    const fallback: EkadashiData = {
        name: 'Ekadashi',
        date: 'Calculating...',
        fastStart: 'Calculating...',
        fastEnd: 'Calculating...',
        paranaStart: '--',
        paranaEnd: '--',
        paranaDate: 'Calculating...',
        significance: 'Ekadashi fasting grants spiritual merit and purification.',
        ekadashiDateObj: Object.freeze(new Date()) as Date,
        paranaDateObj: Object.freeze(new Date()) as Date,
        sunriseStr: '--',
    };

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let offset = 0; offset < 40; offset++) {
            const checkDate = new Date(today.getTime());
            checkDate.setDate(today.getDate() + offset);

            const dayData = getDayData(checkDate, lat, lng);
            if (!dayData?.isEkadashi) continue;

            const monthKey = `${checkDate.getMonth() + 1}-${dayData.paksha}`;
            const ekadashiName = EKADASHI_NAMES[monthKey] || 'Smarta Ekadashi';

            const paranaDate = new Date(checkDate.getTime());
            paranaDate.setDate(checkDate.getDate() + 1);
            const paranaDayData = getDayData(paranaDate, lat, lng);

            const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            const fmtShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

            const sunriseStr = fmtTime(dayData?.sunrise);
            const paranaSunrise = fmtTime(paranaDayData?.sunrise);

            // Parana window: traditional rule is sunrise of next day to end of Dwadashi tithi.
            // We approximate to sunrise + 1/5th of day, capped at 2.5 hours.
            let paranaEnd = '--';
            if (paranaDayData?.sunrise && paranaDayData?.sunset) {
                const dayMs = paranaDayData.sunset.getTime() - paranaDayData.sunrise.getTime();
                const oneFifthDay = dayMs / 5;
                const capMs = 2.5 * 60 * 60 * 1000;
                const paranaWindowMs = Math.min(oneFifthDay, capMs);
                paranaEnd = fmtTime(new Date(paranaDayData.sunrise.getTime() + paranaWindowMs));
            }

            return {
                name: ekadashiName,
                date: fmtDate(checkDate),
                fastStart: `${fmtShort(checkDate)} · Sunrise (${sunriseStr})`,
                fastEnd: `${fmtShort(paranaDate)} · Sunrise`,
                paranaStart: paranaSunrise,
                paranaEnd,
                paranaDate: fmtDate(paranaDate),
                significance: getEkadashiSignificance(ekadashiName),
                ekadashiDateObj: Object.freeze(new Date(checkDate.getTime())) as Date,
                paranaDateObj: Object.freeze(new Date(paranaDate.getTime())) as Date,
                sunriseStr,
            };
        }

        // Should never reach here — Ekadashi occurs every ~15 days
        return fallback;
    } catch {
        return fallback;
    }
}

function getEkadashiSignificance(name: string): string {
    const significances: Record<string, string> = {
        'Varuthini Ekadashi': 'Grants protection and blessings. Devotees are freed from past sins and attain moksha.',
        'Mohini Ekadashi': "Fulfills all desires and grants liberation. Named after Lord Vishnu's Mohini avatar.",
        'Nirjala Ekadashi': 'The most powerful Ekadashi. Waterless fasting grants merit equal to all other Ekadashis combined.',
        'Devshayani Ekadashi': 'Marks the beginning of Chaturmas. Lord Vishnu enters cosmic rest.',
        'Kamika Ekadashi': 'Removes all sins and grants deep devotion to Lord Vishnu.',
        'Pausha Putrada Ekadashi': 'Blesses devotees with children, harmony, and family happiness.',
        'Mokshada Ekadashi': 'Grants liberation (moksha) to the faithful. On this day the Bhagavad Gita was revealed.',
        'Apara Ekadashi': 'Destroys sins of many lifetimes. One of the most merit-granting Ekadashis.',
        'Jaya Ekadashi': 'Frees devotees from ghostly existence. Grants victory over inner enemies.',
        'Amalaki Ekadashi': 'Observing this fast is equal to donating one thousand cows.',
        'Papmochani Ekadashi': 'Removes all sins and grants freedom from the cycle of rebirth.',
        'Kamada Ekadashi': 'Fulfills all righteous desires and removes the sin of even brahma-hatya.',
        'Parsva Ekadashi': 'Observed during the Chaturmas period. Removes all obstacles on the spiritual path.',
        'Indira Ekadashi': 'Liberates ancestors from hellish existence. Observed during the Pitru Paksha period.',
    };
    return significances[name] || 'Observe this sacred fast for spiritual merit and inner purification.';
}

// Backward-compatible alias — function uses live astronomy, name updated for clarity
export const getMockEkadashi = getNextEkadashi;
