import { Particle } from "./Particle.js";
import { Vector2D } from "./Vector2D.js";

const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const particle = new Particle(canvas.width / 2, 50, 2);
let lastTime = 0;

function animate(timestamp: number) {
	const dt = (timestamp - lastTime) / 1000;
	lastTime = timestamp;

	ctx?.clearRect(0, 0, canvas.width, canvas.height);

	const gravity = new Vector2D(0, 980).scale(particle.mass);
	particle.applyForce(gravity);

	particle.update(dt);

	if (particle.position.y >= canvas.height - 20) {
		particle.position.y = canvas.height - 20;
		particle.velocity.y *= -0.7; // Invert vertical speed & lose 30% energy
	}

	ctx?.beginPath();
	ctx?.arc(particle.position.x, particle.position.y, 20, 0, Math.PI * 2);
	ctx!.fillStyle = "crimson";
	ctx?.fill();

	requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
