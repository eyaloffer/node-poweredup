/*
 * Duplo Train - Fanfare Demo
 *
 * Lights alternate red/blue with each horn beat,
 * plays "tata ta ta ta ta tatatata ta ta",
 * then drives forward.
 */

import { PoweredUP, DuploTrainBaseSound } from "../dist/index-node.js";

const RED  = 0x0c;
const BLUE = 0x0f;

const poweredUP = new PoweredUP();
poweredUP.scan();
console.log("Looking for Duplo Train...");

poweredUP.on("discover", async (hub) => {
    console.log(`\nDiscovered: ${hub.name}`);
    await hub.connect();
    console.log("Connected!\n");

    const motor   = await hub.waitForDeviceAtPort("MOTOR");
    const speaker = await hub.waitForDeviceAtPort("SPEAKER");

    console.log("Starting fanfare...\n");

    // --- Phase 1: Flickering lights only ---
    console.log("Phase 1: lights");
    let colorToggle = false;
    const flick = async (ms) => {
        colorToggle = !colorToggle;
        speaker.setLEDColor(colorToggle ? RED : BLUE);
        await hub.sleep(ms);
    };

    // Fast flicker for 3 seconds
    for (let i = 0; i < 15; i++) await flick(400);

    speaker.setLEDColor(0x00); // off
    await hub.sleep(500);

    // --- Phase 2: Horn fanfare, steady white light ---
    console.log("Phase 2: fanfare");
    speaker.setLEDColor(0x01); // white

    const TA   = 30;
    const GAP  = 70;
    const BEAT = 200;

    const ta = async () => {
        speaker.playSound(DuploTrainBaseSound.HORN);
        await hub.sleep(TA + GAP);
    };
    const pause = () => hub.sleep(BEAT);

    // tata
    await ta(); await ta();
    await pause();
    // ta ta ta ta
    await ta();
    await pause();
    await ta();
    await pause();
    await ta();
    await pause();
    await ta();
    await pause();
    // tatatata
    await ta(); await ta(); await ta(); await ta();
    await pause();
    // ta ta
    await ta();
    await pause();
    await ta();

    await hub.sleep(500);

    // --- Phase 3: Forward/backward dance with color cycling ---
    console.log("Phase 3: dance!");
    const allColors = [0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x01];
    //                 green  yell  lblue purp  lpink red  rpink ppink dblue white

    for (let i = 0; i < 10; i++) {
        speaker.setLEDColor(allColors[i]);
        motor.setPower(80);
        await hub.sleep(600);
        motor.setPower(-80);
        await hub.sleep(600);
    }

    motor.brake();
    speaker.setLEDColor(0x00);
    console.log("Done!");
});
