import type { Connectable } from "./Connectable";

export class Spring {
	public bodyA: Connectable;
	public bodyB: Connectable;
	public k: number;
	public b: number;
	public restLength: number;

	constructor(bodyA: Connectable, bodyB: Connectable, k: number) {
		this.bodyA = bodyA;
		this.bodyB = bodyB;
		this.k = k;
		this.b = 2.0; // damping coefficient

		this.restLength = bodyA.position
			.add(bodyB.position.scale(-1))
			.magnitude();
	}

	public update() {
		const displacementVector = this.bodyA.position.add(
			this.bodyB.position.scale(-1),
		);
		const currentLength = displacementVector.magnitude();
		const unitVector = displacementVector.normalize();

		const relativeVelocity = this.bodyA.velocity.add(
			this.bodyB.velocity.scale(-1),
		);
		const vAlong = relativeVelocity.dot(unitVector);

		const springForce = -this.k * (currentLength - this.restLength);
		const dampingForce = -this.b * vAlong;

		const totalForceMag = springForce + dampingForce;
		const F = unitVector.scale(totalForceMag);

		this.bodyA.applyForce?.(F);
		this.bodyB.applyForce?.(F.scale(-1));
	}
}
