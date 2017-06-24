// @providesModule AQ-ADS1x15

import _ from "lodash";
import i2cBus from "i2c-bus";
import Logger from "AQ-Logger";
import Delay from "AQ-Delay";
import Promisify from "AQ-Promisify";

/* eslint-disable no-bitwise */

// chip
const IC_ADS1015 = 0x00;
const IC_ADS1115 = 0x01;

// Pointer Register
const ADS1015_REG_POINTER_MASK = 0x03;
const ADS1015_REG_POINTER_CONVERT = 0x00;
const ADS1015_REG_POINTER_CONFIG = 0x01;
const ADS1015_REG_POINTER_LOWTHRESH = 0x02;
const ADS1015_REG_POINTER_HITHRESH = 0x03;

// Config Register
const ADS1015_REG_CONFIG_OS_MASK = 0x8000;
const ADS1015_REG_CONFIG_OS_SINGLE = 0x8000; // Write: Set to start a single-conversion
const ADS1015_REG_CONFIG_OS_BUSY = 0x0000; // Read: Bit = 0 when conversion is in progress
const ADS1015_REG_CONFIG_OS_NOTBUSY = 0x8000; // Read: Bit = 1 when device is not performing a conversion
const ADS1015_REG_CONFIG_MUX_MASK = 0x7000;
const ADS1015_REG_CONFIG_MUX_DIFF_0_1 = 0x0000; // Differential P = AIN0, N = AIN1 (default)
const ADS1015_REG_CONFIG_MUX_DIFF_0_3 = 0x1000; // Differential P = AIN0, N = AIN3
const ADS1015_REG_CONFIG_MUX_DIFF_1_3 = 0x2000; // Differential P = AIN1, N = AIN3
const ADS1015_REG_CONFIG_MUX_DIFF_2_3 = 0x3000; // Differential P = AIN2, N = AIN3
const ADS1015_REG_CONFIG_MUX_SINGLE_0 = 0x4000; // Single-ended AIN0
const ADS1015_REG_CONFIG_MUX_SINGLE_1 = 0x5000; // Single-ended AIN1
const ADS1015_REG_CONFIG_MUX_SINGLE_2 = 0x6000; // Single-ended AIN2
const ADS1015_REG_CONFIG_MUX_SINGLE_3 = 0x7000; // Single-ended AIN3
const ADS1015_REG_CONFIG_PGA_MASK = 0x0E00;
const ADS1015_REG_CONFIG_PGA_6_144V = 0x0000; // +/-6.144V range
const ADS1015_REG_CONFIG_PGA_4_096V = 0x0200; // +/-4.096V range
const ADS1015_REG_CONFIG_PGA_2_048V = 0x0400; // +/-2.048V range (default)
const ADS1015_REG_CONFIG_PGA_1_024V = 0x0600; // +/-1.024V range
const ADS1015_REG_CONFIG_PGA_0_512V = 0x0800; // +/-0.512V range
const ADS1015_REG_CONFIG_PGA_0_256V = 0x0A00; // +/-0.256V range
const ADS1015_REG_CONFIG_MODE_MASK = 0x0100;
const ADS1015_REG_CONFIG_MODE_CONTIN = 0x0000; // Continuous conversion mode
const ADS1015_REG_CONFIG_MODE_SINGLE = 0x0100; // Power-down single-shot mode (default)
const ADS1015_REG_CONFIG_DR_MASK = 0x00E0;
const ADS1015_REG_CONFIG_DR_128SPS = 0x0000; // 128 samples per second
const ADS1015_REG_CONFIG_DR_250SPS = 0x0020; // 250 samples per second
const ADS1015_REG_CONFIG_DR_490SPS = 0x0040; // 490 samples per second
const ADS1015_REG_CONFIG_DR_920SPS = 0x0060; // 920 samples per second
const ADS1015_REG_CONFIG_DR_1600SPS = 0x0080; // 1600 samples per second (default)
const ADS1015_REG_CONFIG_DR_2400SPS = 0x00A0; // 2400 samples per second
const ADS1015_REG_CONFIG_DR_3300SPS = 0x00C0; // 3300 samples per second (also 0x00E0)
const ADS1115_REG_CONFIG_DR_8SPS = 0x0000; // 8 samples per second
const ADS1115_REG_CONFIG_DR_16SPS = 0x0020; // 16 samples per second
const ADS1115_REG_CONFIG_DR_32SPS = 0x0040; // 32 samples per second
const ADS1115_REG_CONFIG_DR_64SPS = 0x0060; // 64 samples per second
const ADS1115_REG_CONFIG_DR_128SPS = 0x0080; // 128 samples per second
const ADS1115_REG_CONFIG_DR_250SPS = 0x00A0; // 250 samples per second (default)
const ADS1115_REG_CONFIG_DR_475SPS = 0x00C0; // 475 samples per second
const ADS1115_REG_CONFIG_DR_860SPS = 0x00E0; // 860 samples per second
const ADS1015_REG_CONFIG_CMODE_MASK = 0x0010;
const ADS1015_REG_CONFIG_CMODE_TRAD = 0x0000; // Traditional comparator with hysteresis (default)
const ADS1015_REG_CONFIG_CMODE_WINDOW = 0x0010; // Window comparator
const ADS1015_REG_CONFIG_CPOL_MASK = 0x0008;
const ADS1015_REG_CONFIG_CPOL_ACTVLOW = 0x0000; // ALERT/RDY pin is low when active (default)
const ADS1015_REG_CONFIG_CPOL_ACTVHI = 0x0008; // ALERT/RDY pin is high when active
const ADS1015_REG_CONFIG_CLAT_MASK = 0x0004; // Determines if ALERT/RDY pin latches once asserted
const ADS1015_REG_CONFIG_CLAT_NONLAT = 0x0000; // Non-latching comparator (default)
const ADS1015_REG_CONFIG_CLAT_LATCH = 0x0004; // Latching comparator
const ADS1015_REG_CONFIG_CQUE_MASK = 0x0003;
const ADS1015_REG_CONFIG_CQUE_1CONV = 0x0000; // Assert ALERT/RDY after one conversions
const ADS1015_REG_CONFIG_CQUE_2CONV = 0x0001; // Assert ALERT/RDY after two conversions
const ADS1015_REG_CONFIG_CQUE_4CONV = 0x0002; // Assert ALERT/RDY after four conversions
const ADS1015_REG_CONFIG_CQUE_NONE = 0x0003; // Disable the comparator and put ALERT/RDY in high state (default)

// This is a javascript port of python, so use objects instead of dictionaries here
// These simplify and clean the code (avoid the abuse of if/elif/else clauses)
const spsADS1115 = {
    8: ADS1115_REG_CONFIG_DR_8SPS,
    16: ADS1115_REG_CONFIG_DR_16SPS,
    32: ADS1115_REG_CONFIG_DR_32SPS,
    64: ADS1115_REG_CONFIG_DR_64SPS,
    128: ADS1115_REG_CONFIG_DR_128SPS,
    250: ADS1115_REG_CONFIG_DR_250SPS,
    475: ADS1115_REG_CONFIG_DR_475SPS,
    860: ADS1115_REG_CONFIG_DR_860SPS
};

const spsADS1015 = {
    128: ADS1015_REG_CONFIG_DR_128SPS,
    250: ADS1015_REG_CONFIG_DR_250SPS,
    490: ADS1015_REG_CONFIG_DR_490SPS,
    920: ADS1015_REG_CONFIG_DR_920SPS,
    1600: ADS1015_REG_CONFIG_DR_1600SPS,
    2400: ADS1015_REG_CONFIG_DR_2400SPS,
    3300: ADS1015_REG_CONFIG_DR_3300SPS
};

// Dictionary with the programable gains
const pgaADS1x15 = {
    6144: ADS1015_REG_CONFIG_PGA_6_144V,
    4096: ADS1015_REG_CONFIG_PGA_4_096V,
    2048: ADS1015_REG_CONFIG_PGA_2_048V,
    1024: ADS1015_REG_CONFIG_PGA_1_024V,
    512: ADS1015_REG_CONFIG_PGA_0_512V,
    256: ADS1015_REG_CONFIG_PGA_0_256V
};

export default {
    connect,
    readSingle,

    _getConfig
};

function connect() {
    this.address = 0x48;
    this.i2c = i2cBus.openSync(1);
    this.writeWord = Promisify(this.i2c.writeWord, this.i2c);
    this.readWord = Promisify(this.i2c.readWord, this.i2c);
}

// Gets a single-ended ADC reading from the specified channel in mV. \
// The sample rate for this mode (single-shot) can be used to lower the noise \
// (low sps) or to lower the power consumption (high sps) by duty cycling, \
// see datasheet page 14 for more info. \
// The pga must be given in mV, see page 13 for the supported values.

async function readSingle(channel, pga = 6144, sps = 250) {
    let config = this._getConfig(channel, pga, sps);

    // Set 'start single-conversion' bit
    config |= ADS1015_REG_CONFIG_OS_SINGLE;

    // Write config register to the ADC
    await this.writeWord(this.address, ADS1015_REG_POINTER_CONFIG, encodeWord(config));

    // Wait for the ADC conversion to complete
    // The minimum delay depends on the sps: delay >= 1/sps
    // We add 0.1ms to be sure
    const delay = (1000 / sps) + 10;
    await Delay.wait(delay);

    // Read the conversion results
    const word = await this.readWord(this.address, ADS1015_REG_POINTER_CONVERT);
    const value = decodeWord(word);

    return (value * (pga / 1000)) / 32768.0;
}

function encodeWord(value) {
    const msb = (value >> 8) & 0xFF;
    const lsb = value & 0xFF;

    return msb | (lsb << 8);
}

function decodeWord(word) {
    const msb = word & 0xFF;
    const lsb = (word >> 8) & 0xFF;

    return (msb << 8) | lsb;
}

function _getConfig(channel, pga, sps) {
    // Disable comparator, Non-latching, Alert/Rdy active low
    // traditional comparator, single-shot mode
    let config = ADS1015_REG_CONFIG_CQUE_NONE |
        ADS1015_REG_CONFIG_CLAT_NONLAT |
        ADS1015_REG_CONFIG_CPOL_ACTVLOW |
        ADS1015_REG_CONFIG_CMODE_TRAD |
        ADS1015_REG_CONFIG_MODE_SINGLE;

    if (_.isNil(spsADS1115[sps])) {
        Logger.throw("Invalid sps specified");
    }

    config |= spsADS1115[sps];

    // Set PGA/voltage range, defaults to +-6.144V
    if (_.isNil(pgaADS1x15[pga])) {
        Logger.throw("Invalid pga specified");
    }

    config |= pgaADS1x15[pga];

    // Set the channel to be converted
    switch (channel) {
        case 0:
            config |= ADS1015_REG_CONFIG_MUX_SINGLE_0;
            break;

        case 1:
            config |= ADS1015_REG_CONFIG_MUX_SINGLE_1;
            break;

        case 2:
            config |= ADS1015_REG_CONFIG_MUX_SINGLE_2;
            break;

        case 3:
            config |= ADS1015_REG_CONFIG_MUX_SINGLE_3;
            break;

        default:
            Logger.throw("Channel must be between 0 and 3");

    }

    return config;
}
