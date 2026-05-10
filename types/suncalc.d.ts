declare module 'suncalc' {
    export function getTimes(date: Date, latitude: number, longitude: number): {
        sunrise: Date;
        sunset: Date;
        solarNoon: Date;
        nadir: Date;
        sunriseEnd: Date;
        sunsetStart: Date;
        dawn: Date;
        dusk: Date;
        nauticalDawn: Date;
        nauticalDusk: Date;
        nightEnd: Date;
        night: Date;
        goldenHourEnd: Date;
        goldenHour: Date;
    };
    export function getPosition(date: Date, latitude: number, longitude: number): {
        altitude: number;
        azimuth: number;
    };
    export function getMoonPosition(date: Date, latitude: number, longitude: number): {
        altitude: number;
        azimuth: number;
        distance: number;
        parallacticAngle: number;
    };
    export function getMoonIllumination(date: Date): {
        fraction: number;
        phase: number;
        angle: number;
    };
    export function getMoonTimes(date: Date, latitude: number, longitude: number, inUTC?: boolean): {
        rise: Date;
        set: Date;
        alwaysUp: boolean;
        alwaysDown: boolean;
    };
}
