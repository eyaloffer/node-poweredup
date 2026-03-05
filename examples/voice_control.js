/*
 * Duplo Train - Hebrew Voice Control
 *
 * Run: node examples/voice_control.js
 * Then open http://localhost:3000 in Chrome and speak Hebrew.
 *
 * Commands:
 *   קדימה  → forward
 *   אחורה  → backward
 *   עצור   → stop
 *   צופר   → horn
 *   אדום   → red LED
 *   כחול   → blue LED
 *   ירוק   → green LED
 *   צהוב   → yellow LED
 *   סגול   → purple LED
 *   לבן    → white LED
 *   כבה    → LED off
 */

import http from "http";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PoweredUP, DuploTrainBaseSound } from "../dist/index-node.js";

const __dir = dirname(fileURLToPath(import.meta.url));

// --- Train state ---
let motor   = null;
let speaker = null;
let trainReady = false;

const poweredUP = new PoweredUP();
poweredUP.scan();
console.log("Looking for Duplo Train...");

poweredUP.on("discover", async (hub) => {
    console.log(`Discovered: ${hub.name}`);
    await hub.connect();
    console.log("Connected!");

    motor   = await hub.waitForDeviceAtPort("MOTOR");
    speaker = await hub.waitForDeviceAtPort("SPEAKER");
    trainReady = true;
    console.log("Train ready. Open http://localhost:3000 in Chrome.\n");
});

// --- Command handler ---
function handleCommand({ action, value }) {
    if (!trainReady) return { ok: false, error: "Train not connected" };

    switch (action) {
        case "forward":  motor.setPower(80);                    break;
        case "backward": motor.setPower(-80);                   break;
        case "stop":     motor.brake(); motor.setPower(0);      break;
        case "horn":     speaker.playSound(DuploTrainBaseSound.HORN); break;
        case "led":      speaker.setLEDColor(value);            break;
        default: return { ok: false, error: `Unknown action: ${action}` };
    }
    return { ok: true };
}

// --- HTTP server ---
const HTML = readFileSync(join(__dir, "voice_control.html"), "utf8");

const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(HTML);
        return;
    }

    if (req.method === "GET" && req.url === "/status") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ready: trainReady }));
        return;
    }

    if (req.method === "POST" && req.url === "/command") {
        let body = "";
        req.on("data", d => body += d);
        req.on("end", () => {
            try {
                const cmd = JSON.parse(body);
                const result = handleCommand(cmd);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(result));
                if (result.ok) console.log(`→ ${cmd.action}${cmd.value !== undefined ? " " + cmd.value : ""}`);
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ ok: false, error: e.message }));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(3000, "0.0.0.0", () => console.log("Server ready at http://0.0.0.0:3000"));
