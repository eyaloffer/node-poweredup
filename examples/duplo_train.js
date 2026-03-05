/*
 *
 * This demonstrates controlling a Duplo Train hub.
 *
 */

import { PoweredUP } from "../dist/index-node.js";

const poweredUP = new PoweredUP();
poweredUP.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    console.log(`Discovered ${hub.name}!`);
    await hub.connect(); // Connect to the Hub
    console.log("Connected");

    const motor = await hub.waitForDeviceAtPort("MOTOR");
    console.log("Motor ready!");

    while (true) { // Repeat indefinitely
        console.log("Running motor forward at speed 100 for 2 seconds");
        motor.setPower(100);
        await hub.sleep(2000);
        console.log("Running motor reverse at speed 100 for 2 seconds");
        motor.setPower(-100);
        await hub.sleep(2000);
        motor.brake();
    }
});
