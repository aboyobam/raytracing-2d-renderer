export default class Vector2 {
    constructor(public x: number, public y: number) {};

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    add(v: Vector2) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v: Vector2) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }


    mult(v: Vector2) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    multScalar(s: number) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    lenSq() {
        return this.x ** 2 + this.y ** 2;
    }

    len() {
        return Math.sqrt(this.lenSq());
    } 

    neg() {
        this.x *= -1;
        this.y *= -1;
        return this;
    }

    norm() {
        const length = this.len()
        if (length === 0) return this;
        this.x /= length;
        this.y /= length;
        return this;
    }
}