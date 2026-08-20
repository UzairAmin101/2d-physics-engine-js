import type { Connectable } from "./Connectable.js";
import { Vector2D } from "./Vector2D.js";

export class Particle implements Connectable {
	public position: Vector2D;
	public velocity: Vector2D;
	public acceleration: Vector2D;
	public mass: number;
	public invMass: number;

	public isPinned: boolean = false;

	constructor(x: number, y: number, mass: number = 1) {
		this.position = new Vector2D(x, y);
		this.velocity = new Vector2D(0, 0);
		this.acceleration = new Vector2D(0, 0);
		this.mass = mass;
		this.invMass = mass !== 0 ? 1 / mass : 0; // An invMass of 0 means static/immovable object
	}

	applyForce(force: Vector2D): void {
		if (this.isPinned) return;
		this.acceleration = this.acceleration.add(force.scale(this.invMass));
	}

	update(dt: number): void {
		if (this.isPinned) return;

		this.velocity = this.velocity.add(this.acceleration.scale(dt));
		this.position = this.position.add(this.velocity.scale(dt));

		this.acceleration = new Vector2D(0, 0);
	}
}
