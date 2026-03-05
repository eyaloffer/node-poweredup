/*
 * Duplo Train - Full Capabilities Demo
 *
 * Demonstrates: motor speeds, sound (horn), LED colors, color sensor, speedometer, voltage
 *
 * New firmware protocol (device type 0x5a):
 *   Sound:  mode=0x01, payload=[0x07, soundId, 0x00, 0x00]  — only soundId=1 (horn) confirmed
 *   LED:    mode=0x01, payload=[0x04, 0x01, colorCode, 0x00]
 *   Colors: 0x00=off, 0x01=white, 0x07=green, 0x08=yellow, 0x09=lightblue,
 *           0x0a=purple, 0x0c=red, 0x0f=darkblue
 */

import { PoweredUP, DuploTrainBaseSound, ColorNames } from "../dist/index-node.js";

const poweredUP = new PoweredUP();
poweredUP.scan();
console.log("Looking for Duplo Train...");

poweredUP.on("discover", async (hub) => {
    console.log(`\nDiscovered: ${hub.name}`);
    await hub.connect();
    console.log("Connected!\n");

    const motor      = await hub.waitForDeviceAtPort("MOTOR");
    const speaker    = await hub.waitForDeviceAtPort("SPEAKER");
    const color      = await hub.waitForDeviceAtPort("COLOR");
    const speedometer = await hub.waitForDeviceAtPort("SPEEDOMETER");

    console.log("All devices ready.\n");

    // --- Live sensor readouts ---
    speedometer.on("speed", ({ speed }) => {
        process.stdout.write(`\r  Speed: ${speed.toString().padStart(4)} cm/s   `);
    });
    speedometer.subscribe();

    color.on("color", ({ color: c }) => {
        console.log(`\n  Color detected: ${ColorNames[c] || c}`);
    });
    color.subscribe("color");

    // --- Demo sequence ---

    // 1. Horn
    console.log("=== 1. Horn ===");
    speaker.playSound(DuploTrainBaseSound.HORN);
    await hub.sleep(2000);

    // 2. LED colors
    console.log("=== 2. LED colors ===");
    const ledColors = [[0x07,"green"],[0x08,"yellow"],[0x09,"lightblue"],[0x0a,"purple"],[0x0c,"red"],[0x0f,"darkblue"],[0x01,"white"]];
    for (const [code, name] of ledColors) {
        console.log(`  ${name}`);
        speaker.setLEDColor(code);
        await hub.sleep(800);
    }
    speaker.setLEDColor(0x00); // off

    // 3. Accelerate forward
    console.log("=== 3. Accelerate forward (20 → 100) ===");
    for (let speed = 20; speed <= 100; speed += 20) {
        console.log(`  Power: ${speed}`);
        motor.setPower(speed);
        await hub.sleep(800);
    }
    await hub.sleep(1000);

    // 4. Horn while running
    console.log("\n=== 4. Horn while running ===");
    speaker.playSound(DuploTrainBaseSound.HORN);
    await hub.sleep(2000);

    // 5. Brake
    console.log("=== 5. Brake ===");
    motor.brake();
    await hub.sleep(1000);
    motor.setPower(0);

    // 6. Reverse
    console.log("=== 6. Reverse (speed 60) ===");
    motor.setPower(-60);
    await hub.sleep(2500);

    // 7. Stop
    console.log("=== 7. Stop ===");
    motor.brake();
    await hub.sleep(500);
    motor.setPower(0);

    // 8. Battery voltage
    const voltage = hub.batteryLevel;
    console.log(`\n=== 8. Battery level: ${voltage}% ===`);

    console.log("\nDemo complete! Ctrl+C to exit.");
});
