// @providesModule AQ-Config

export default {
    pumpOnTimeSeconds: 60,
    ledChannels: {
        RoyalBlue1: 0,
        RoyalBlue2: 1,
        RoyalBlue3: 2,
        RoyalBlue4: 3,
        UV: 4,
        WarmWhite: 5,
        ColdWhite1: 6,
        ColdWhite2: 7,
        Red: 11,
        Green: 12,
        Blue: 14
    },
    waterSensors: {
        minStabilityReadings: 20,
        maxChange: 0.01,
        a2d: {
            vIn: 0,
            sump: 1,
            reservoir: 2
        }
    },
    autoTopOff: {
        pumpPin: 26,
        sump: {
            min: 8,
            max: 9
        },
        reservoir: {
            min: 2,
            alert: 3
        }
    }
};
