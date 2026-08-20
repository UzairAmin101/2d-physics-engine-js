import { Particle } from "./Particle.js";
import { Simulation, type ToolMode } from "./Simulation.js";
import { Vector2D } from "./Vector2D.js";

const PARTICLE_RADIUS = 20;
const K = 30; // Spring stiffness
const C = 2.0; // Damping coefficient

const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const particle = new Particle(canvas.width / 2, 50, 2);
const anchor = new Vector2D(canvas.width / 2, 100);
let lastTime = 0;

let isDragging = false;
let mousePos = new Vector2D(0, 0);
let previousMousePos = new Vector2D(0, 0);

// canvas.addEventListener("mousedown", (e) => {
// 	const rect = canvas.getBoundingClientRect();
// 	mousePos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);

// 	const offset = mousePos.add(particle.position.scale(-1));
// 	if (offset.magnitude() <= PARTICLE_RADIUS) {
// 		isDragging = true;
// 		previousMousePos = mousePos;
// 	}
// });

// canvas.addEventListener("mousemove", (e) => {
// 	const rect = canvas.getBoundingClientRect();
// 	mousePos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);
// });

// canvas.addEventListener("mouseup", () => {
// 	isDragging = false;
// });

function animate(timestamp: number) {
	const dt = (timestamp - lastTime) / 1000;
	lastTime = timestamp;

	ctx?.clearRect(0, 0, canvas.width, canvas.height);

	if (isDragging) {
		const throwVector = mousePos.add(previousMousePos.scale(-1));
		particle.velocity = throwVector.scale(1 / dt);

		particle.position.x = mousePos.x;
		particle.position.y = mousePos.y;
		previousMousePos = mousePos;
	} else {
		const x = particle.position.add(anchor.scale(-1));

		const springForce = x.scale(-K);

		const dampingForce = particle.velocity.scale(-C);

		const gravity = new Vector2D(0, 980).scale(particle.mass);

		particle.applyForce(gravity);
		particle.applyForce(springForce);
		particle.applyForce(dampingForce);

		particle.update(dt);
	}

	if (particle.position.y >= canvas.height - PARTICLE_RADIUS) {
		particle.position.y = canvas.height - PARTICLE_RADIUS;
		particle.velocity.y *= -0.7; // Invert vertical speed & lose 30% energy
	}

	if (particle.position.y <= PARTICLE_RADIUS) {
		particle.position.y = PARTICLE_RADIUS;
		particle.velocity.y *= -0.7;
	}

	if (particle.position.x >= canvas.width - PARTICLE_RADIUS) {
		particle.position.x = canvas.width - PARTICLE_RADIUS;
		particle.velocity.x *= -0.7;
	}

	if (particle.position.x <= 20) {
		particle.position.x = 20;
		particle.velocity.x *= -0.7;
	}

	ctx?.beginPath();
	ctx?.moveTo(anchor.x, anchor.y);
	ctx?.lineTo(particle.position.x, particle.position.y);
	ctx!.strokeStyle = "yellow";
	ctx?.stroke();

	ctx?.beginPath();
	ctx?.arc(
		particle.position.x,
		particle.position.y,
		PARTICLE_RADIUS,
		0,
		Math.PI * 2,
	);
	ctx!.fillStyle = "crimson";
	ctx?.fill();

	ctx?.beginPath();
	ctx?.arc(anchor.x, anchor.y, 5, 0, Math.PI * 2);
	ctx!.fillStyle = "yellow";
	ctx?.fill();

	requestAnimationFrame(animate);
}

// requestAnimationFrame(animate);

function setupUI(sim: Simulation): void {
	const buttons = document.querySelectorAll<HTMLButtonElement>(".tool-btn");

	const setActiveTool = (tool: ToolMode) => {
		sim.setTool(tool);
		buttons.forEach((btn) => {
			btn.classList.toggle("active", btn.dataset.tool === tool);
		});
	};

	// Button click listeners
	buttons.forEach((btn) => {
		btn.addEventListener("click", () => {
			const tool = btn.dataset.tool as ToolMode;
			setActiveTool(tool);
		});
	});

	// window.addEventListener("keydown", (e) => {
	// 	if (e.key === "1") setActiveTool(ToolMode.SPAWN);
	// 	if (e.key === "2") setActiveTool(ToolMode.CONNECT);
	// 	if (e.key === "3") setActiveTool(ToolMode.DELETE);
	// });
}

const simulation = new Simulation(canvas);
setupUI(simulation);
simulation.run();
