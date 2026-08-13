import { Vector2D } from "./Vector2D.js";

export class Particle {
	public position: Vector2D;
	public velocity: Vector2D;
	public acceleration: Vector2D;
	public mass: number;
	public invMass: number;

	constructor(x: number, y: number, mass: number = 1) {
		this.position = new Vector2D(x, y);
		this.velocity = new Vector2D(0, 0);
		this.acceleration = new Vector2D(0, 0);
		this.mass = mass;
		this.invMass = mass !== 0 ? 1 / mass : 0; // An invMass of 0 means static/immovable object
	}

	update(dt: number): void {
		this.velocity = this.velocity.add(this.acceleration.scale(dt));
		this.position = this.position.add(this.velocity.scale(dt));

		this.acceleration = new Vector2D(0, 0);
	}

	applyForce(force: Vector2D): void {
		this.acceleration = this.acceleration.add(force.scale(this.invMass));
	}
}
