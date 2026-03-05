import { Device } from "./device.js";

import { IDeviceInterface } from "../interfaces.js";

import * as Consts from "../consts.js";

/**
 * @class DuploTrainBaseSpeaker
 * @extends Device
 */
export class DuploTrainBaseSpeaker extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.DUPLO_TRAIN_BASE_SPEAKER);
    }

    /**
     * Play a built-in train sound.
     *
     * New firmware (device type 0x5a): mode=0x01, payload=[0x07, soundId, 0x00, 0x00]
     * Only DuploTrainBaseSound.HORN (soundId=1) is confirmed on new firmware.
     *
     * @param {DuploTrainBaseSound} sound
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public playSound (sound: Consts.DuploTrainBaseSound) {
        this.subscribe(Mode.SOUND);
        return this.writeDirect(0x01, Buffer.from([0x07, sound, 0x00, 0x00]));
    }

    /**
     * Set the LED color of the train.
     *
     * New firmware (device type 0x5a): mode=0x01, payload=[0x04, 0x01, colorCode, 0x00]
     *
     * Color codes: 0x00=off, 0x01=white, 0x07=green, 0x08=yellow, 0x09=lightblue,
     *              0x0a=purple, 0x0b=lightpink, 0x0c=red, 0x0d=redpink,
     *              0x0e=purplepink, 0x0f=darkblue
     *
     * @param {number} color
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public setLEDColor (color: number) {
        this.subscribe(Mode.SOUND);
        return this.writeDirect(0x01, Buffer.from([0x04, 0x01, color, 0x00]));
    }

    /**
     * Play a built-in system tone.
     * @param {number} tone
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public playTone (tone: number) {
        this.subscribe(Mode.TONE);
        return this.writeDirect(0x02, Buffer.from([tone]));
    }

}

export enum Mode {
    SOUND = 0x01,
    TONE = 0x02
}
