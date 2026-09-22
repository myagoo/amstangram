import { generating, numberEq, numberRange } from "./helpers.js";

export class IntAdjoinSqrt2 {
    coeffInt: number; coeffSqrt: number;
    constructor(coeffInt: number, coeffSqrt: number) {
        this.coeffInt = coeffInt;
        this.coeffSqrt = coeffSqrt;
    }
    dup() {
        return new IntAdjoinSqrt2(this.coeffInt, this.coeffSqrt);
    }

    toFloat() {
        return this.coeffInt + this.coeffSqrt * Math.SQRT2;
    }

    eq(other: IntAdjoinSqrt2) {
        if (generating) {
            return this.coeffInt === other.coeffInt && this.coeffSqrt === other.coeffSqrt;
        } else {
            return numberEq(this.coeffInt, other.coeffInt) && numberEq(this.coeffSqrt, other.coeffSqrt);
        }
    }

    sameSign(other: IntAdjoinSqrt2) {
        var zero = new IntAdjoinSqrt2(0, 0);
        return zero.compare(this) === zero.compare(other);
    }

    compare(other: IntAdjoinSqrt2) {
        if (this.eq(other)) {
            return 0;
        } else {
            var floatThis = this.toFloat();
            var floatOther = other.toFloat();
            if (floatThis < floatOther) {
                return -1;
            } else {
                return 1;
            }
        }
        /* Other possible method without conversion to float
         * if (this.eq(other)){
         *    return 0;
         * } else if ((this.coeffInt > other.coeffInt && this.coeffSqrt >= other.coeffSqrt)
         *   || (this.coeffInt >= other.coeffInt && this.coeffSqrt > other.coeffSqrt)){
         *   return 1;
         * }  else if ((this.coeffInt < other.coeffInt && this.coeffSqrt <= other.coeffSqrt) ||
         *    this.coeffInt <= other.coeffInt && this.coeffSqrt < other.coeffSqrt){
         *    return -1;
         * } else{
         *  // a + bx < c + dx -> a-c < (d-b)x
         *  var bothPositive = (this.coeffInt - other.coeffInt > 0 && other.coeffSqrt - this.coeffSqrt > 0);
         *  var bothNegative = (this.coeffInt - other.coeffInt < 0 && other.coeffSqrt - this.coeffSqrt < 0);
         *  var left = this.coeffInt*this.coeffInt + other.coeffInt*other.coeffInt;
         *  left -= this.coeffInt * other.coeffInt * 2;
         *   var right = other.coeffSqrt*other.coeffSqrt + this.coeffSqrt*this.coeffSqrt;
         *    right -= other.coeffSqrt * this.coeffSqrt * 2;
         *   right *= 2;
         *   if (bothPositive && left > right){
         *       return 1;
         *   } else if (bothPositive && left < right){
         *       return -1;
         *   } else if (bothNegative && left < right){
         *       return 1;
         *   } else if (bothNegative && left > right) {
         *       return -1;
         *   } else {
         *       ??
         *   }
         * }  */
    }

    distance(other: IntAdjoinSqrt2) {
        var result = this.dup();
        result.subtract(other);
        return result.abs();
    }

    closeNumbers(other: IntAdjoinSqrt2, range: number) {
        return numberRange(this.toFloat(), other.toFloat(), range);
    }

    isZero() {
        if (generating) {
            return this.coeffInt === 0 && this.coeffSqrt === 0;
        } else {
            return (numberEq(this.coeffInt, 0) && numberEq(this.coeffSqrt, 0));
        }
    }

    add(other: IntAdjoinSqrt2) {
        this.coeffInt += other.coeffInt;
        this.coeffSqrt += other.coeffSqrt;
        return this;
    }

    subtract(other: IntAdjoinSqrt2) {
        this.coeffInt -= other.coeffInt;
        this.coeffSqrt -= other.coeffSqrt;
        return this;
    }

    multiply(other: IntAdjoinSqrt2) {
        /* (a + bx)*(c + dx) = (ac + bdxx) + (ad + bc)*x where x = sqrt(2) */
        var coeffIntCopy = this.coeffInt;
        this.coeffInt = coeffIntCopy * other.coeffInt + 2 * this.coeffSqrt * other.coeffSqrt;
        this.coeffSqrt = coeffIntCopy * other.coeffSqrt + this.coeffSqrt * other.coeffInt;
        return this;
    }

    div(other: IntAdjoinSqrt2) {
        var denominator = other.coeffInt * other.coeffInt - 2 * other.coeffSqrt * other.coeffSqrt;
        if (numberEq(denominator, 0)) {
            //console.log("Division by 0 is not possible!");
            return;
        }
        /* (a + bx)/(c + dx) = ((a + bx)*(c - dx))/((c + dx)*(c - dx)) with x = sqrt(2)
         * = (ac- 2bd)/(cc - ddxx) + (bc- ad)*x/(cc - ddxx) */
        var coeffIntCopy = this.coeffInt;
        this.coeffInt = coeffIntCopy * other.coeffInt - 2 * this.coeffSqrt * other.coeffSqrt;
        this.coeffSqrt = this.coeffSqrt * other.coeffInt - coeffIntCopy * other.coeffSqrt;
        return this;
    }

    neg() {
        this.coeffInt = -this.coeffInt;
        this.coeffSqrt = -this.coeffSqrt;
        return this;
    }

    abs() {
        if (this.toFloat() < 0) {
            this.coeffInt = -this.coeffInt;
            this.coeffSqrt = -this.coeffSqrt;
        }
        return this;
    }

    scale(factor: number) {
        if (numberEq(factor, 0)) {
            console.log("Scaling by 0 is not possible!");
            /* Somehow this fixes strange Safari error ?? */
            console.log(JSON.stringify(this));
            return;
        }
        this.coeffInt *= factor;
        this.coeffSqrt *= factor;
        return this;
    }
}

export const compareIntAdjoinSqrt2s = function(numberA: IntAdjoinSqrt2, numberB: IntAdjoinSqrt2) {
    return numberA.compare(numberB);
};

export const IntAdjoinSqrt2Min = function(a: IntAdjoinSqrt2, b: IntAdjoinSqrt2) {
    var compare = a.compare(b);
    if (compare <= 0) {
        return a;
    } else {
        return b;
    }
};

export const IntAdjoinSqrt2Max = function(a: IntAdjoinSqrt2, b: IntAdjoinSqrt2) {
    var compare = a.compare(b);
    if (compare >= 0) {
        return a;
    } else {
        return b;
    }
};
