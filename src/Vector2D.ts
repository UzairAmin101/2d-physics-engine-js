export class Vector2D {
	constructor(
		public x: number = 0,
		public y: number,
	) {}

	add(other: Vector2D): Vector2D {
		return new Vector2D(this.x + other.x, this.y + other.y);
	}

	scale(n: number): Vector2D {
		return new Vector2D(this.x * n, this.y * n);
	}

	magnitude(): number {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	normalize(): Vector2D {
		if (this.x === 0 && this.y === 0) {
			return new Vector2D(0, 0);
		}

		return this.scale(1 / this.magnitude());
	}

	public dot(other: Vector2D): number {
		return this.x * other.x + this.y * other.y;
	}
}
