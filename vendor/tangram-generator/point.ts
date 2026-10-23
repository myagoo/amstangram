import { toRadians, toDegrees, clipAngle, numberEq, numberNEq } from "./helpers.js";
import { IntAdjoinSqrt2 } from "./intadjoinsqrt2.js";

export class Point {
    x: IntAdjoinSqrt2; y: IntAdjoinSqrt2;
    constructor(x?: IntAdjoinSqrt2, y?: IntAdjoinSqrt2) {
        if (typeof x === 'undefined') {
            this.x = new IntAdjoinSqrt2(0, 0);
        } else {
            this.x = x;
        }
        if (typeof y === 'undefined') {
            this.y = new IntAdjoinSqrt2(0, 0);
        } else {
            this.y = y;
        }
    }
    dup() {
        return new Point(this.x.dup(), this.y.dup());
    }

    toFloatX() {
        return this.x.toFloat();
    }

    toFloatY() {
        return this.y.toFloat();
    }

    compare(other: Point) {
        var xCompare = this.x.compare(other.x);
        var yCompare = this.y.compare(other.y);
        if (xCompare != 0) {
            return xCompare;
        } else {
            return yCompare;
        }
    }

    compareYX(other: Point) {
        var xCompare = this.x.compare(other.x);
        var yCompare = this.y.compare(other.y);
        if (yCompare != 0) {
            return yCompare;
        } else {
            return xCompare;
        }
    }

    multipleOf(other: Point) {
        /* Direction vectors are a multiple of each other if they either are both
         * equal to (0,0), if they both have the form (0,a) or (a,0) where the a has
         * has the same sign in both cases or (a,b) = s*(c,d) */
        var sameSignX = this.x.sameSign(other.x);
        var sameSignY = this.y.sameSign(other.y);
        if (!(sameSignX && sameSignY)) return false;
        if (this.x.isZero() && other.x.isZero()) {
            if (this.y.isZero() && other.y.isZero()) {
                return true;
            } else {
                return sameSignY;
            }
        } else if (this.y.isZero() && other.y.isZero()) {
            return sameSignX;
        } else {
            var xFactor = this.x.dup().div(other.x);
            var yFactor = this.y.dup().div(other.y);
            if (typeof xFactor === 'undefined' || typeof yFactor === 'undefined') {
                console.log("Undefined");
                console.log(this.x.coeffInt + "," + this.x.coeffSqrt + " - " + this.y.coeffInt + "," + this.y.coeffSqrt);
                console.log(other.x.coeffInt + "," + other.x.coeffSqrt + " - " + other.y.coeffInt + "," + other.y.coeffSqrt);
                return false;
            } else {
                /*var res = xFactor.eq(yFactor);
                if (res) {
                    console.log("True");
                    console.log(this.x.coeffInt + "," + this.x.coeffSqrt + " - "  + this.y.coeffInt + "," + this.y.coeffSqrt);
                    console.log(other.x.coeffInt + "," + other.x.coeffSqrt + " - "  + other.y.coeffInt + "," + other.y.coeffSqrt);
                }*/
                return xFactor.eq(yFactor);
            }
        }
    }

    eq(other: Point) {
        return this.x.eq(other.x) && this.y.eq(other.y);
    }

    isZero() {
        return this.x.isZero() && this.y.isZero();
    }

    length() {
        return Math.sqrt(this.dotProduct(this).toFloat());
    }

    neg() {
        this.x.neg();
        this.y.neg();
        return this;
    }

    angle() {
        if (this.isZero()) {
            return 0;
        }
        var angle = Math.atan2(this.toFloatY(), this.toFloatX());
        angle = clipAngle(toDegrees(angle));
        /* (Angles should be multiples of 45 degrees, so this shouldn't cause problems */
        return Math.round(angle);
    }

    distance(other: Point) {
        var toOther = other.dup().subtract(this);
        return toOther.length();
    }

    angleTo(other: Point) {
        /* The angle is calculated with atan2, which is not defined for (0,0).
         * Therefore, handle cases where one point is (0,0) first */
        if (this.isZero()) {
            return other.angle();
        }
        if (other.isZero()) {
            return this.angle();
        }
        var angle = 360 - (other.angle() - this.angle());
        angle = clipAngle(angle);
        return angle;
    }

    add(other: Point) {
        this.x.add(other.x);
        this.y.add(other.y);
        return this;
    }

    middle(other: Point) {
        var result = new Point();
        result.add(this);
        result.add(other);
        result.scale(0.5);
        return result;
    }

    subtract(other: Point) {
        this.x.subtract(other.x);
        this.y.subtract(other.y);
        return this;
    }

    normalize() {
        var length = this.length();
        if (numberNEq(length, 0)) {
            this.x.scale(1 / length);
            this.y.scale(1 / length);
        }
        return this;
    }

    dotProduct(other: Point) {
        /* Multiplication of respective coordinates then summation of those products */
        return this.x.dup().multiply(other.x).add(this.y.dup().multiply(other.y));
    }

    determinant(other: Point) {
        /* In 2D, the cross product corresponds to the determinant of the matrix with the
         * two points as rows or columns */
        return this.x.dup().multiply(other.y).subtract(this.y.dup().multiply(other.x));
    }

    transform(transMatrix: IntAdjoinSqrt2[][]) {
        if (transMatrix.length != 3) {
            console.log("Matrix seems to have the wrong dimension!");
            return;
        }
        var z = new IntAdjoinSqrt2(1, 0);
        var copy = this.dup();
        this.x = copy.x.dup().multiply(transMatrix[0][0]);
        this.x.add(copy.y.dup().multiply(transMatrix[0][1]));
        this.x.add(z.dup().multiply(transMatrix[0][2]));
        this.y = copy.x.dup().multiply(transMatrix[1][0]);
        this.y.add(copy.y.dup().multiply(transMatrix[1][1]));
        this.y.add(z.dup().multiply(transMatrix[1][2]));
        var zCopy = z.dup();
        z = copy.x.dup().multiply(transMatrix[2][0]);
        z.add(copy.y.dup().multiply(transMatrix[2][1]));
        z.add(zCopy.dup().multiply(transMatrix[2][2]));
        if (numberNEq(z, 1) && numberNEq(z, 0)) {
            this.x.div(z);
            this.y.div(z);
        }
        return this;
    }

    translate(transX: IntAdjoinSqrt2, transY: IntAdjoinSqrt2) {
        var translationMatrix =
            [[new IntAdjoinSqrt2(1, 0), new IntAdjoinSqrt2(0, 0), transX],
            [new IntAdjoinSqrt2(0, 0), new IntAdjoinSqrt2(1, 0), transY],
            [new IntAdjoinSqrt2(0, 0), new IntAdjoinSqrt2(0, 0), new IntAdjoinSqrt2(1, 0)]];
        return this.transform(translationMatrix);
    }

    rotate(angle: number) {
        /* Transform angle to that it falls in the interval [0;360] */
        angle = clipAngle(angle);
        var cos;
        var sin;
        /* Handle cases where the angle is a multiple of 45 degrees first */
        /* If angle is not a multiple of 45 degrees */
        if (angle % 45 != 0) {
            cos = new IntAdjoinSqrt2(Math.cos(toRadians(angle)), 0);
            sin = new IntAdjoinSqrt2(Math.sin(toRadians(angle)), 0);
        } else {
            /* Determine value of sin and cos */
            if (angle % 90 != 0) {
                cos = new IntAdjoinSqrt2(0, 0.5);
                sin = new IntAdjoinSqrt2(0, 0.5);
            } else if (angle % 180 != 0) {
                cos = new IntAdjoinSqrt2(0, 0);
                sin = new IntAdjoinSqrt2(1, 0);
            } else {
                cos = new IntAdjoinSqrt2(1, 0);
                sin = new IntAdjoinSqrt2(0, 0);
            }
            /* Determine the sign of sin and cos */
            if (angle > 180 && angle < 360) {
                sin.neg();
            }
            if (angle > 90 && angle < 270) {
                cos.neg();
            }
        }
        var rotationMatrix = [[cos, sin.dup().neg(), new IntAdjoinSqrt2(0, 0)],
        [sin, cos, new IntAdjoinSqrt2(0, 0)],
        [new IntAdjoinSqrt2(0, 0), new IntAdjoinSqrt2(0, 0), new IntAdjoinSqrt2(1, 0)]];
        this.transform(rotationMatrix);
        return this;
    }

    scale(factor: number) {
        if (numberEq(0, factor)) {
            console.log("Attempt to scale by 0!");
            /* Somehow this fixes strange Safari error ?? */
            console.log(JSON.stringify(this));
            return;
        }
        this.x.scale(factor);
        this.y.scale(factor);
        return this;
    }
}

export const comparePoints = function(pointA: Point, pointB: Point) {
    return pointA.compare(pointB);
};

export const comparePointsYX = function(pointA: Point, pointB: Point) {
    return pointA.compareYX(pointB);
};

export const closePoint = function(pointA: Point, pointB: Point, range: number) {
    return pointA.x.closeNumbers(pointB.x, range) && pointA.y.closeNumbers(pointB.y, range);
};

export const relativeOrientation = function(pointA: Point, pointB: Point, pointC: Point) {
    var determinant = pointA.dup().subtract(pointC).determinant(pointB.dup().subtract(pointC));
    if (determinant.isZero()) {
        return 0;
    } else {
        return determinant.toFloat() > 0 ? 1 : -1;
    }
};

export const bothPointsMultipleTimes = function(pointArray: Point[], pointA: Point, pointB: Point) {
    var occurrenceA = [];
    var occurrenceB = [];
    for (var pointId = 0; pointId < pointArray.length; pointId++) {
        if (pointArray[pointId].eq(pointA)) {
            occurrenceA.push(pointId);
        }
        if (pointArray[pointId].eq(pointB)) {
            occurrenceB.push(pointId);
        }
    }
    return occurrenceA.length >= 2 && occurrenceB.length >= 2;
};
