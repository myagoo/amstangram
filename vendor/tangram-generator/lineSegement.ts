import { comparePoints, relativeOrientation, Point } from "./point.js";

export class LineSegment {
    point1: Point; point2: Point;
    constructor(point1: Point | "undefined", point2: Point | "undefined") {
        if (point1 === 'undefined') {
            this.point1 = new Point();
        } else {
            this.point1 = point1;
        }
        if (point2 === 'undefined') {
            this.point2 = new Point();
        } else {
            this.point2 = point2;
        }
        /* Order the points so that the point with lower x and lower y values is
         * saved in point1 */
        if (!this.point1.isZero() && !this.point2.isZero() || this.point2.isZero() && !this.point1.isZero()) {
            var compare = this.point1.compare(this.point2);
            if (compare === 1) {
                var point1Copy = this.point1;
                this.point1 = this.point2;
                this.point2 = point1Copy;
            }
        }
    }
    dup() {
        return new LineSegment(this.point1.dup(), this.point2.dup());
    }

    length() {
        return this.point1.distance(this.point2);
    }

    direction() {
        return this.point2.dup().subtract(this.point1);
    }

    lineParameters() {
        /* For each point on a line segment the following equation holds: point_1 +
         * t*(point_2 - point_1). The points on the segment have t between 0 and 1,
         * for t outside that interval, the point lies only on the line formed by the
         * connection of the two points, not on the segment itself. By using one
         * equation for both x- and y-coordinates, solving for t and than setting the
         * two equations equal, the calculation below for the line parameters can be
         * derived. Cases where the line is parallel to either the x- or y-axis have
         * to be treated specially (as they would to lead to e.g. division by 0) */
        var parameters = [];
        if (this.point1.x.eq(this.point2.x)) {
            parameters[0] = 1.0;
            parameters[1] = 0.0;
            parameters[2] = this.point1.x.dup().neg().toFloat();
        } else if (this.point1.y.eq(this.point2.y)) {
            parameters[0] = 0.0;
            parameters[1] = 1.0;
            parameters[2] = this.point1.y.dup().neg().toFloat();
        } else {
            /* Comes from line equations using points -> solve for t, set equal */
            var direction = this.direction();
            parameters[0] = direction.toFloatX() / direction.toFloatY();
            parameters[1] = -1.0;
            parameters[2] = this.point2.determinant(this.point1).toFloat()
                / direction.toFloatX();
        }
        return parameters;
    }

    eq(other: LineSegment) {
        return (this.point1.eq(other.point1) && this.point2.eq(other.point2)) ||
            (this.point2.eq(other.point1) && this.point1.eq(other.point2));
    }

    compare(other: LineSegment) {
        var point1Compare = this.point1.compare(other.point1);
        var point2Compare = this.point2.compare(other.point2);
        // Point.compare always returns a number.
        if (point1Compare != 0) {
            return point1Compare;
        } else {
            return point2Compare;
        }
    }

    split(splitPoints: Point[]) {
        /* If no points are given, return this segment in an array*/
        if (splitPoints.length === 0) {
            return [this];
        }
        /* Sort points along segment */
        splitPoints = splitPoints.sort(comparePoints);
        /* Create new segments - staring from the first point of this segment, all
         * following segments go from the last process point to the next split point */
        var segments = [];
        segments[0] = new LineSegment(this.point1, splitPoints[0]);
        var i;
        for (i = 1; i < splitPoints.length; i++) {
            segments[i] = new LineSegment(splitPoints[i - 1], splitPoints[i]);
        }
        segments[i] = new LineSegment(splitPoints[i - 1], this.point2);
        return segments;
    }

    projectedParameter(point: Point) {
        if (this.point1.eq(this.point2)) {
            return 1;
        }
        /* Projection of point onto line is the same as projection of the vector start
         * to point onto the direction vector. This projection vector p is parallel
         * to the direction vector (thus just a scaled version of it) => p = s *
         * normalized_direction. s is equal to the length of the vector to project
         * times the cos of the angle the two vectors enclose. This again is equal
         * to the dot product of the vector to project and the normalized other vector,
         * leading to the calculation below */
        var startToPoint = point.dup().subtract(this.point1);
        var direction = this.direction();
        var parameter = startToPoint.dotProduct(direction).toFloat()
            / (direction.dotProduct(direction)).toFloat();
        return parameter;
    }

    onSegment(point: Point) {
        if (point.eq(this.point1) || point.eq(this.point2) || this.point1.eq(this.point2)) {
            return false;
        }
        /* Calculate twice the area of the triangle of the two segment points and the
         * given point, if the area is 0, the three points are collinear */
        if (relativeOrientation(this.point1, this.point2, point) === 0) {
            var parameter = this.projectedParameter(point);
            /* Check if parameter is so that the point lies within the two segment points */
            if (parameter >= 0 && parameter <= 1) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    onSegmentIncludingEndpoints(point: Point) {
        if (point.eq(this.point1) || point.eq(this.point2) || this.point1.eq(this.point2)) {
            return true;
        }
        /* Calculate twice the area of the triangle of the two segment points and the
         * given point, if the area is 0, the three points are collinear */
        if (relativeOrientation(this.point1, this.point2, point) === 0) {
            var parameter = this.projectedParameter(point);
            /* Check if parameter is so that the point lies within the two segment points */
            if (parameter >= 0 && parameter <= 1) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    intersectsOrientations(other: LineSegment) {
        /* Find the four relative orientations for all combinations of one line segments
         * and one point from the respective other line segment */
        var orient1 = relativeOrientation(this.point1, this.point2, other.point1);
        var orient2 = relativeOrientation(this.point1, this.point2, other.point2);
        var orient3 = relativeOrientation(other.point1, other.point2, this.point1);
        var orient4 = relativeOrientation(other.point1, other.point2, this.point2);
        /* The lines intersect if the points from one line segments do not lie on the
         * same side of the other line segment (and the other way around) */
        if (orient1 != orient2 && orient3 != orient4) {
            return true;
        } else {
            return false;
        }
    }

    intersectsIncludingSegment(other: LineSegment) {
        if (this.point1.eq(other.point1) || this.point2.eq(other.point1)
            || this.point1.eq(other.point2) || this.point2.eq(other.point2)) {
            return false;
        }
        return this.intersectsOrientations(other);
    }

    intersects(other: LineSegment) {
        /* First check if any of the endpoints are contained in the respective other
         * segment */
        if (this.onSegmentIncludingEndpoints(other.point1) || this.onSegmentIncludingEndpoints(other.point2) ||
            other.onSegmentIncludingEndpoints(this.point1) || other.onSegmentIncludingEndpoints(this.point2)) {
            return false;
        }
        return this.intersectsOrientations(other);
    }

    angleTo(other: LineSegment) {
        /* Find common endpoint and calculate direction vectors from the common point
         * to two other points */
        var thisDirection;
        var otherDirection;
        if (this.point1.eq(other.point1)) {
            thisDirection = this.direction();
            otherDirection = other.direction();
        } else if (this.point1.eq(other.point2)) {
            thisDirection = this.direction();
            otherDirection = other.direction().scale(-1)!;
        } else if (this.point2.eq(other.point1)) {
            thisDirection = this.direction().scale(-1)!;
            otherDirection = other.direction();
        } else if (this.point2.eq(other.point2)) {
            thisDirection = this.direction().scale(-1)!;
            otherDirection = other.direction().scale(-1)!;
        } else {
            /* No common point */
            return;
        }
        /* Angle between those is Angle between the segments */
        return thisDirection.angleTo(otherDirection);
    }
}

export const compareLineSegments = function(segmentA: LineSegment, segmentB: LineSegment) {
    return segmentA.compare(segmentB);
};
