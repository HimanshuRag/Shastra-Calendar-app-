import { GeoVector, Body, Ecliptic } from 'astronomy-engine'
import SunCalc from 'suncalc'

export interface DayData {
    tithi: string;
    tithiNumber: number;
    paksha: 'Shukla' | 'Krishna';
    nakshatra: string;          // always set — was incorrectly typed as optional
    nakshatraIndex: number;
    festival?: string;
    isEkadashi?: boolean;
    isFestival?: boolean;
    isMajorFestival?: boolean;  // true for Diwali, Holi, Navratri, Janmashtami, etc.
    isPurnima?: boolean;
    isAmavasya?: boolean;
    isPanchak: boolean;
    isBhadra: boolean;
    karana: string;
    vara: string; // Sanskrit weekday
    sunrise?: Date;
    sunset?: Date;
    tithiEndTime?: Date;
}

export interface MonthCalendar {
    year: number;
    month: number; // 0-indexed
    days: Record<string, DayData>; // key: "YYYY-MM-DD"
}

const TITHIS_SHUKLA = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'
];

const TITHIS_KRISHNA = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
];

const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadra', 'Uttara Bhadra', 'Revati'
];

const VARA = ['Ravivara', 'Somavara', 'Mangalavara', 'Budhavara', 'Guruvara', 'Shukravara', 'Shanivara'];

// 11 karanas in the cycle: 7 recurring + 4 fixed
// Vishti (Bhadra) is karana #7 in the recurring set (0-indexed: 6)
const KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];
const FIXED_KARANAS = ['Shakuni', 'Chatushpada', 'Nagava', 'Kimstughna'];

/**
 * Lahiri ayanamsa — increases ~50.3 arcsec/year (~0.01397°/year).
 * Reference epoch: J2000.0 (1 Jan 2000 12:00 TT) = 23.853°
 * Returns the ayanamsa in degrees for a given Date.
 */
export function getLahiriAyanamsa(date: Date): number {
    const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0)
    const yearsSince2000 = (date.getTime() - J2000) / (365.25 * 24 * 3600 * 1000)
    return 23.853 + yearsSince2000 * 0.01397
}

function getMoonSunDiff(date: Date): number {
    const sunVec = GeoVector(Body.Sun, date, true);
    const sunEcl = Ecliptic(sunVec);
    const moonVec = GeoVector(Body.Moon, date, true);
    const moonEcl = Ecliptic(moonVec);
    return (moonEcl.elon - sunEcl.elon + 360) % 360;
}

/**
 * Binary search for the moment when the Moon–Sun elongation next crosses
 * a 12° boundary (i.e., the current tithi ends).
 * Searches up to 72 hours to handle long tithis near lunar apogee.
 */
function findTithiEnd(startDate: Date, currentTithiFloor: number): Date {
    // Search up to 3 days forward in 2-hour steps to find the bracket
    let lo = new Date(startDate);
    let hi = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2h

    for (let i = 0; i < 36; i++) { // max 72 hours
        const diff = getMoonSunDiff(hi);
        const hiFloor = Math.floor(diff / 12) % 30;
        if (hiFloor !== currentTithiFloor) break;
        lo = new Date(hi);
        hi = new Date(hi.getTime() + 2 * 60 * 60 * 1000);
    }

    // Binary search within the bracket (precision ~1 minute)
    for (let i = 0; i < 20; i++) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const diff = getMoonSunDiff(mid);
        const midFloor = Math.floor(diff / 12) % 30;
        if (midFloor === currentTithiFloor) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    return hi;
}

function getKarana(diff: number): { name: string; isBhadra: boolean } {
    // Each karana = 6° of elongation. 60 karanas in a lunar month.
    const karanaIndex = Math.floor(diff / 6) % 60;

    // Fixed karanas: 0 = Kimstughna (first half of Shukla Pratipada)
    // 57 = Shakuni, 58 = Chatushpada, 59 = Nagava
    if (karanaIndex === 0) return { name: FIXED_KARANAS[3], isBhadra: false }; // Kimstughna
    if (karanaIndex === 57) return { name: FIXED_KARANAS[0], isBhadra: false }; // Shakuni
    if (karanaIndex === 58) return { name: FIXED_KARANAS[1], isBhadra: false }; // Chatushpada
    if (karanaIndex === 59) return { name: FIXED_KARANAS[2], isBhadra: false }; // Nagava

    // Recurring karanas: cycle through 7 karanas (Bava..Vishti)
    const recurringIdx = (karanaIndex - 1) % 7;
    const name = KARANAS[recurringIdx];
    return { name, isBhadra: recurringIdx === 6 }; // Vishti = Bhadra
}

/** Sun's sidereal ecliptic longitude (Lahiri). */
function getSiderealSunLongitude(date: Date): number {
    const sunVec = GeoVector(Body.Sun, date, true);
    const sunEcl = Ecliptic(sunVec);
    const ayanamsa = getLahiriAyanamsa(date);
    return (sunEcl.elon - ayanamsa + 360) % 360;
}

/**
 * Vedic solar month (Saura Masa) index based on Sun's sidereal longitude.
 * 0=Mesha/Chaitra, 1=Vrishabha/Vaishakha, 2=Mithuna/Jyeshtha,
 * 3=Karka/Ashadha, 4=Simha/Shravana, 5=Kanya/Bhadrapada,
 * 6=Tula/Ashwin, 7=Vrischika/Kartik, 8=Dhanu/Margashirsha,
 * 9=Makara/Paush, 10=Kumbha/Magha, 11=Meena/Phalguna
 */
function getVedicSolarMonth(sunLon: number): number {
    return Math.floor(sunLon / 30);
}

/**
 * Detect a major Hindu festival from astronomical parameters.
 * Returns English festival name or null.
 */
function detectMajorFestival(
    solarMonth: number,
    paksha: 'Shukla' | 'Krishna',
    tithiNumber: number,   // 1–15
    tithiIndex: number,    // 1–30
    nakshatraIndex: number
): string | null {
    // ── CHAITRA / MESHA (solarMonth = 0) ──────────────────────────────────
    if (solarMonth === 0 && paksha === 'Shukla') {
        if (tithiNumber === 9) return 'Ram Navami';
        const chaitraDays = [
            'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi',
            'Panchami', 'Shashti', 'Saptami', 'Durgashtami',
        ];
        if (tithiNumber >= 1 && tithiNumber <= 8)
            return `Chaitra Navratri · ${chaitraDays[tithiNumber - 1]}`;
    }

    // ── BHADRAPADA / KANYA (solarMonth = 5) ────────────────────────────────
    if (solarMonth === 5) {
        if (paksha === 'Shukla' && tithiNumber === 4)
            return 'Ganesh Chaturthi';
        if (paksha === 'Krishna' && tithiNumber === 8)
            return nakshatraIndex === 3
                ? 'Krishna Janmashtami · Rohini'
                : 'Krishna Janmashtami';
    }

    // ── ASHWIN / TULA (solarMonth = 6) ─────────────────────────────────────
    if (solarMonth === 6 && paksha === 'Shukla') {
        if (tithiNumber === 10) return 'Dussehra · Vijayadashami';
        if (tithiNumber === 9)  return 'Maha Navami · Navratri Day 9';
        const ashwinDays = [
            'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi',
            'Panchami', 'Shashti', 'Saptami', 'Durgashtami',
        ];
        if (tithiNumber >= 1 && tithiNumber <= 8)
            return `Sharad Navratri · ${ashwinDays[tithiNumber - 1]}`;
    }

    // ── KARTIK / VRISCHIKA (solarMonth = 7) ────────────────────────────────
    if (solarMonth === 7) {
        if (paksha === 'Krishna') {
            if (tithiNumber === 13) return 'Dhanteras';
            if (tithiNumber === 14) return 'Naraka Chaturdashi · Choti Diwali';
        }
        if (tithiIndex === 30)          return 'Diwali · Lakshmi Puja';   // Kartik Amavasya
        if (paksha === 'Shukla') {
            if (tithiNumber === 1)      return 'Govardhan Puja';
            if (tithiNumber === 2)      return 'Bhai Dooj';
        }
    }

    // ── SHRAVANA / SIMHA (solarMonth = 4) ──────────────────────────────────
    if (solarMonth === 4 && tithiIndex === 15) return 'Raksha Bandhan';  // Shravana Purnima

    // ── MAGHA / KUMBHA (solarMonth = 10) ───────────────────────────────────
    if (solarMonth === 10 && paksha === 'Krishna' && tithiNumber === 14)
        return 'Maha Shivratri';

    // ── PHALGUNA / MEENA (solarMonth = 11) ─────────────────────────────────
    if (solarMonth === 11 && tithiIndex === 15) return 'Holi · Holika Dahan';

    return null;
}

export function getDayData(date: Date, lat = 28.6139, lng = 77.2090): DayData | null {
    // C-09: always compute at 12:00 IST (= 06:30 UTC) so users on any timezone
    // see the same Vedic day. Local setHours(12) was wrong for non-IST devices.
    const targetDate = new Date(date.getTime());
    targetDate.setUTCHours(6, 30, 0, 0); // 06:30 UTC = 12:00 IST

    // Guard against NaN propagation from invalid dates
    if (isNaN(targetDate.getTime())) return null;

    const diff = getMoonSunDiff(targetDate);
    if (!isFinite(diff)) return null;

    const tithiContinuous = diff / 12;
    const tithiFloor = Math.floor(tithiContinuous) % 30;
    const tithiIndex = tithiFloor + 1; // 1-30

    const paksha: 'Shukla' | 'Krishna' = tithiIndex <= 15 ? 'Shukla' : 'Krishna';
    const tithiNumber = tithiIndex <= 15 ? tithiIndex : tithiIndex - 15;

    let tithiName = paksha === 'Shukla' ? TITHIS_SHUKLA[tithiNumber - 1] : TITHIS_KRISHNA[tithiNumber - 1];
    if (!tithiName) tithiName = 'Pratipada';

    // Nakshatra — dynamic Lahiri ayanamsa (updates yearly, not hardcoded)
    const moonVec = GeoVector(Body.Moon, targetDate, true);
    const moonEcl = Ecliptic(moonVec);
    const ayanamsa = getLahiriAyanamsa(targetDate);
    const siderealMoon = (moonEcl.elon - ayanamsa + 360) % 360;
    const nakshatraIndex = Math.floor(siderealMoon / (360 / 27));
    // Clamp index defensively in case of floating-point edge case
    const safeIndex = Math.max(0, Math.min(26, nakshatraIndex));
    const nakshatraName = NAKSHATRAS[safeIndex];

    const isEkadashi = tithiNumber === 11;
    const isPurnima = tithiIndex === 15;
    // BUG-01 fix: tithiIndex === 0 is unreachable (range is 1-30); keep only === 30
    const isAmavasya = tithiIndex === 30;

    // Major festival detection (takes priority over generic labels)
    const sunLon = getSiderealSunLongitude(targetDate);
    const solarMonth = getVedicSolarMonth(sunLon);
    const majorFestival = detectMajorFestival(solarMonth, paksha, tithiNumber, tithiIndex, safeIndex);

    let festivalLabel: string | undefined;
    if (majorFestival) {
        festivalLabel = majorFestival;
    } else if (isEkadashi) {
        festivalLabel = 'Smarta Ekadashi';
    } else if (isPurnima) {
        festivalLabel = 'Purnima Vrat';
    } else if (isAmavasya) {
        festivalLabel = 'Darsha Amavasya';
    }

    const times = SunCalc.getTimes(targetDate, lat, lng);

    // Karana & Bhadra
    const karanaResult = getKarana(diff);

    // Panchak: last 5 nakshatras (Dhanishtha=22 through Revati=26, 0-indexed)
    // Traditional rule: only 2nd half of Dhanishtha counts.
    // Each nakshatra spans 13.333°; the 2nd half of Dhanishtha starts at 13.333/2 = 6.667° into it.
    let isPanchak = false;
    if (nakshatraIndex >= 23) {
        // Shatabhisha (23) through Revati (26) — full nakshatras always Panchak
        isPanchak = true;
    } else if (nakshatraIndex === 22) {
        // Dhanishtha — only 2nd half triggers Panchak
        const posWithinNakshatra = siderealMoon % (360 / 27);
        isPanchak = posWithinNakshatra >= (360 / 27 / 2);
    }

    // Tithi end time
    let tithiEndTime: Date | undefined;
    try {
        tithiEndTime = findTithiEnd(targetDate, tithiFloor);
    } catch {
        // Leave undefined — caller should render '--' not a fabricated time
    }

    return {
        tithi: tithiName,
        tithiNumber,
        paksha,
        nakshatra: nakshatraName,
        nakshatraIndex: safeIndex,
        vara: VARA[targetDate.getDay()],
        isEkadashi,
        isPurnima,
        isAmavasya,
        festival: festivalLabel,
        isFestival: !!majorFestival || isPurnima || isAmavasya || isEkadashi,
        isMajorFestival: !!majorFestival,
        sunrise: times.sunrise,
        sunset: times.sunset,
        isPanchak,
        isBhadra: karanaResult.isBhadra,
        karana: karanaResult.name,
        tithiEndTime,
    };
}

export function getDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
