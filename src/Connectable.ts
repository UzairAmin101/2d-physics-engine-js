import type { Vector2D } from "./Vector2D";

export interface Connectable {
	position: Vector2D;
	velocity: Vector2D; // TODO: Should this be made optional too for fixed anchors?
	applyForce?: (force: Vector2D) => void; // Optional, since fixed anchors won't move!
}
