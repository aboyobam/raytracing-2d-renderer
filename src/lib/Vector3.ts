import Decimal from "decimal.js";

type NumOrDecimal = Decimal | number;

export default class Vector3 {
    static get ZERO() {
        return new Vector3();
    }

    static midpoint(a: Vector3, b: Vector3): Vector3 {
        return a.add(b).multScalar(1 / 2);
    }

    static min(...vertecies: Vector3[]): Vector3 {
        return new Vector3(
            Decimal.min(...vertecies.map(v => v.x)),
            Decimal.min(...vertecies.map(v => v.y)),
            Decimal.min(...vertecies.map(v => v.z))
        );
    }

    static max(...vertecies: Vector3[]): Vector3 {
        return new Vector3(
            Decimal.max(...vertecies.map(v => v.x)),
            Decimal.max(...vertecies.map(v => v.y)),
            Decimal.max(...vertecies.map(v => v.z))
        );
    }
    
    constructor(x: NumOrDecimal = 0, y: NumOrDecimal = 0, z: NumOrDecimal = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    };

    private _x: Decimal;
    private _y: Decimal;
    private _z: Decimal;

    get x(): Decimal { return this._x; }
    get y(): Decimal { return this._y; }
    get z(): Decimal { return this._z; }

    set x(val: NumOrDecimal) {
        if (typeof val === "number") {
            this._x = new Decimal(val);
        } else {
            this._x = val;
        }
    }

    set y(val: NumOrDecimal) {
        if (typeof val === "number") {
            this._y = new Decimal(val);
        } else {
            this._y = val;
        }
    }

    set z(val: NumOrDecimal) {
        if (typeof val === "number") {
            this._z = new Decimal(val);
        } else {
            this._z = val;
        }
    }

    set(x: NumOrDecimal, y: NumOrDecimal, z: NumOrDecimal) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    clone() {
        return new Vector3(new Decimal(this.x.valueOf()), new Decimal(this.y.valueOf()), new Decimal(this.z.valueOf()));
    }

    copy(v: Vector3) {
        this._x = new Decimal(v.x.valueOf());
        this._y = new Decimal(v.y.valueOf());
        this._z = new Decimal(v.z.valueOf());
    }

    add(v: Vector3) {
        return new Vector3(this.x.add(v.x), this.y.add(v.y), this.z.add(v.z));
    }

    sub(v: Vector3) {
        return new Vector3(this.x.sub(v.x), this.y.sub(v.y), this.z.sub(v.z));
    }


    mult(v: Vector3) {
        return new Vector3(this.x.mul(v.x), this.y.mul(v.y), this.z.mul(v.z));
    }

    multScalar(s: NumOrDecimal) {
        return new Vector3(this.x.mul(s), this.y.mul(s), this.z.mul(s));
    }

    lenSq() {
        return this.x.pow(2).add(this.y.pow(2)).add(this.z.pow(2));
    }

    len() {
        return this.lenSq().sqrt();
    }

    dot(v: Vector3) {
        return this.x.mul(v.x).add(this.y.mul(v.y)).add(this.z.mul(v.z));
    }
    
    cross(v: Vector3) {
        const x = this.y.mul(v.z).sub(this.z.mul(v.y));
        const y = this.z.mul(v.x).sub(this.x.mul(v.z));
        const z = this.x.mul(v.y).sub(this.y.mul(v.x));
        return new Vector3(x, y, z);
    }

    norm() {
        const length = this.len();
        if (length.eq(0)) return new Vector3();

        if (length.eq(1)) {
            return this;
        }
        
        return new Vector3(this.x.div(length), this.y.div(length), this.z.div(length));
    }

    pretty(fixed = 3) {
        return `Vector3(x = ${this.x.toFixed(fixed)}, y = ${this.y.toFixed(fixed)}, z = ${this.z.toFixed(fixed)})`;
    }
}