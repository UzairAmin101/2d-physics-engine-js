import { Particle } from "./Particle";
import { Spring } from "./Spring";
import { Vector2D } from "./Vector2D";

export type ToolMode =
	| "SELECT"
	| "SPAWN_PARTICLE"
	| "SPAWN_ANCHOR"
	| "CONNECT_SPRING"
	| "DELETE";

export class Simulation {
	public canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D | null;
	private lastTime: number = performance.now();
	private gravity = new Vector2D(0, 980);
	private PARTICLE_RADIUS = 20;
	private PARTICLE_MASS = 2;
	private K = 30;

	private isDragging = false;
	private draggedParticle: Particle | null = null;

	private currentTool: ToolMode = "SPAWN_PARTICLE";
	private selectedBodyA: Particle | null = null;

	private mousePos: Vector2D = new Vector2D(0, 0);
	private previousMousePos: Vector2D = new Vector2D(0, 0);

	private particles: Particle[] = [];
	private springs: Spring[] = [];

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");

		this.canvas.addEventListener("click", (event: MouseEvent) => {
			const mousePos = this.getMousePos(event);
			const clickedObject = this.getObjectAt(mousePos);

			this.handleCanvasClick(mousePos, clickedObject);
		});

		this.canvas.addEventListener("mousedown", (event: MouseEvent) => {
			const mousePos = this.getMousePos(event);
			this.handleMouseDown(mousePos);
		});

		this.canvas.addEventListener("mousemove", (event: MouseEvent) => {
			const mousePos = this.getMousePos(event);
			this.handleMouseMove(mousePos);
		});

		this.canvas.addEventListener("mouseup", () => {
			this.handleMouseUp();
		});
	}

	public run(): void {
		this.animate();
	}

	public setTool(tool: ToolMode): void {
		this.currentTool = tool;
		this.selectedBodyA = null;
		this.draggedParticle = null;
	}

	private getMousePos(event: MouseEvent): Vector2D {
		const rect = this.canvas.getBoundingClientRect();
		return new Vector2D(
			event.clientX - rect.left,
			event.clientY - rect.top,
		);
	}

	private getObjectAt(mousePos: Vector2D): Particle | null {
		const clickedParticle = this.particles.find((p) => {
			const dx = mousePos.x - p.position.x;
			const dy = mousePos.y - p.position.y;

			return (
				dx * dx + dy * dy <= this.PARTICLE_RADIUS * this.PARTICLE_RADIUS
			);
		});

		return clickedParticle || null;
	}

	private handleCanvasClick(
		mousePos: Vector2D,
		clickedObject: Particle | null,
	): void {
		switch (this.currentTool) {
			case "SELECT":
				break;

			case "CONNECT_SPRING":
				if (!clickedObject) {
					break;
				}

				if (!this.selectedBodyA) {
					this.selectedBodyA = clickedObject;
				} else if (this.selectedBodyA !== clickedObject) {
					const spring = new Spring(
						this.selectedBodyA,
						clickedObject,
						this.K,
					);
					this.springs.push(spring);
					this.selectedBodyA = null;
				}
				break;

			case "SPAWN_PARTICLE":
				if (!clickedObject) {
					this.particles.push(
						new Particle(
							mousePos.x,
							mousePos.y,
							this.PARTICLE_MASS,
						),
					);
				}
				break;

			case "SPAWN_ANCHOR": // TODO: Implement fixed anchors
				break;

			case "DELETE": // TODO: Add option to remove just the springs without removing particles
				if (clickedObject) {
					this.particles = this.particles.filter(
						(p) => p !== clickedObject,
					);

					this.springs = this.springs.filter(
						(s) =>
							s.bodyA !== clickedObject &&
							s.bodyB !== clickedObject,
					);
				}
				break;
		}
	}

	private animate = (currentTime = performance.now()): void => {
		const dt = (currentTime - this.lastTime) / 1000;
		this.lastTime = currentTime;

		this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.particles.forEach((p) => {
			p.applyForce(this.gravity.scale(p.mass));
		});
		this.springs.forEach((s) => {
			s.update();
		});
		this.particles.forEach((p) => {
			p.update(dt);
		});

		this.handleBoundaryCollisions();
		this.drawSprings();
		this.drawParticles();

		requestAnimationFrame(this.animate);
	};

	private handleBoundaryCollisions(): void {
		this.particles.forEach((p) => {
			if (p.position.y >= this.canvas.height - this.PARTICLE_RADIUS) {
				p.position.y = this.canvas.height - this.PARTICLE_RADIUS;
				p.velocity.y *= -0.7; // Invert vertical speed & lose 30% energy
			}

			if (p.position.y <= this.PARTICLE_RADIUS) {
				p.position.y = this.PARTICLE_RADIUS;
				p.velocity.y *= -0.7;
			}

			if (p.position.x >= this.canvas.width - this.PARTICLE_RADIUS) {
				p.position.x = this.canvas.width - this.PARTICLE_RADIUS;
				p.velocity.x *= -0.7;
			}

			if (p.position.x <= this.PARTICLE_RADIUS) {
				p.position.x = this.PARTICLE_RADIUS;
				p.velocity.x *= -0.7;
			}
		});
	}

	private drawParticles(): void {
		this.particles.forEach((p) => {
			this.ctx?.beginPath();
			this.ctx?.arc(
				p.position.x,
				p.position.y,
				this.PARTICLE_RADIUS,
				0,
				Math.PI * 2,
			);
			this.ctx!.fillStyle = "crimson";
			this.ctx?.fill();
		});
	}

	private drawSprings(): void {
		this.springs.forEach((s) => {
			this.ctx?.beginPath();
			this.ctx?.moveTo(s.bodyA.position.x, s.bodyA.position.y);
			this.ctx?.lineTo(s.bodyB.position.x, s.bodyB.position.y);
			this.ctx!.strokeStyle = "yellow";
			this.ctx?.stroke();
		});
	}

	private handleMouseDown(mousePos: Vector2D): void {
		if (this.currentTool === "SELECT") {
			const clickedObject = this.getObjectAt(mousePos);
			if (clickedObject) {
				this.draggedParticle = clickedObject;
				this.isDragging = true;
			}
		}
	}

	private handleMouseMove(mousePos: Vector2D): void {
		if (this.isDragging && this.draggedParticle) {
			this.draggedParticle.position = mousePos;
			this.draggedParticle.velocity = new Vector2D(0, 0); // TODO: Add throw feature
		}
	}

	private handleMouseUp(): void {
		this.isDragging = false;
		this.draggedParticle = null;
	}
}

// TODO: Visual Aids & Feedback: Render dynamic features like spring tension colors (changing color based on compression/stretch) or velocity vectors on particles.
