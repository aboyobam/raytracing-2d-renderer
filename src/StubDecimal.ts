type NumOrDecimal = number | StubDecimal;

export default class StubDecimal {
    static set() {};

    private static convert(n: NumOrDecimal): number {
        if (n instanceof StubDecimal) {
            return n.num;
        } else {
            return n;
        }
    }

    static max(...values: NumOrDecimal[]) {
        return new StubDecimal(Math.max(...values.map(v => StubDecimal.convert(v))));
    }

    static min(...values: NumOrDecimal[]) {
        return new StubDecimal(Math.min(...values.map(v => StubDecimal.convert(v))));
    }

    constructor(public readonly num: number) {};

    add(v: NumOrDecimal) {
        return new StubDecimal(this.num + StubDecimal.convert(v));
    }

    sub(v: NumOrDecimal) {
        return new StubDecimal(this.num - StubDecimal.convert(v));
    }

    div(v: NumOrDecimal) {
        return new StubDecimal(this.num / StubDecimal.convert(v));
    }

    mul(v: NumOrDecimal) {
        return new StubDecimal(this.num * StubDecimal.convert(v));
    }

    pow(v: NumOrDecimal) {
        return new StubDecimal(this.num ** StubDecimal.convert(v));
    }

    sqrt() {
        return new StubDecimal(Math.sqrt(this.num));
    }

    abs() {
        return new StubDecimal(Math.abs(this.num));
    }

    eq(v: NumOrDecimal) {
        return this.num == StubDecimal.convert(v);
    }

    lt(v: NumOrDecimal) {
        return this.num < StubDecimal.convert(v);
    }

    lte(v: NumOrDecimal) {
        return this.num <= StubDecimal.convert(v);
    }

    gt(v: NumOrDecimal) {
        return this.num > StubDecimal.convert(v);
    }

    gte(v: NumOrDecimal) {
        return this.num >= StubDecimal.convert(v);
    }
}