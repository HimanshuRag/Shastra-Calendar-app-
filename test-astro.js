const { GeoVector, Body, Ecliptic } = require('astronomy-engine');
const SunCalc = require('suncalc');

const date = new Date('2026-04-12T12:00:00Z');

// Exact Tithi math via Astronomy Engine
const sunVec = GeoVector(Body.Sun, date, true);
const sunEcl = Ecliptic(sunVec);
const moonVec = GeoVector(Body.Moon, date, true);
const moonEcl = Ecliptic(moonVec);

const diff = (moonEcl.elon - sunEcl.elon + 360) % 360;
const tithi = Math.floor(diff / 12) + 1;
console.log('Sun Lng:', sunEcl.elon, 'Moon Lng:', moonEcl.elon);
console.log('Diff:', diff, 'Tithi number:', tithi);

// Sunrise/Sunset via SunCalc
const lat = 28.6139;
const lng = 77.2090;
const times = SunCalc.getTimes(date, lat, lng);
console.log('Sunrise:', times.sunrise);
console.log('Sunset:', times.sunset);
