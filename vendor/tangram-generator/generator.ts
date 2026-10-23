import { numberEq, shuffleArray, eliminateDuplicates, setGenerating } from "./helpers.js";
import { IntAdjoinSqrt2 } from "./intadjoinsqrt2.js";
import { comparePoints, Point } from "./point.js";
import { compareLineSegments, LineSegment } from "./lineSegement.js";
import { Directions, SegmentDirections, numOrientations } from "./directions.js";
import { getAllPoints, computeBoundingBox, containsPoint, Tan } from "./tan.js";
import { compareTangrams, Tangram } from "./tangram.js";
import { createRandom } from "./random.js";

var range = new IntAdjoinSqrt2(50, 0);

var increaseProbability = 50;

const checkNewTan = function(currentTans: Tan[], newTan: Tan) {
    /* For each point of the new piece, check if it overlaps with already placed
     * tans */
    var points = newTan.getPoints();
    /* Use inside points to detect exact alignment of one piece in another */
    var allTanPoints = points.concat(newTan.getInsidePoints());
    for (var tansId = 0; tansId < currentTans.length; tansId++) {
        var currentPoints = currentTans[tansId].getPoints();
        var onSegmentCounter = 0;
        for (var pointId = 0; pointId < allTanPoints.length; pointId++) {
            var contains = containsPoint(currentPoints, allTanPoints[pointId]);
            if (contains === 1) {
                return false;
            } else if (contains === 0) {
                onSegmentCounter++;
            }
        }
        /* If more than 3 points of the new tan lie on one of the already placed
         * tans, there must be an overlap */
        if (onSegmentCounter >= 3) {
            return false;
        }
        /* Apply the same check the other way around: and already placed piece
         * lies inside the new piece */
        onSegmentCounter = 0;
        currentPoints = currentPoints.concat(currentTans[tansId].getInsidePoints());
        for (pointId = 0; pointId < currentPoints.length; pointId++) {
            contains = containsPoint(points, currentPoints[pointId]);
            if (contains === 1) {
                return false;
            } else if (contains === 0) {
                onSegmentCounter++;
            }
        }
        if (onSegmentCounter >= 3) {
            return false;
        }
    }
    /* Check if any of the segments of the already placed tans  is intersected
     * by any of the line segments of the new tan */
    var tanSegments = newTan.getSegments();
    for (var segmentId = 0; segmentId < tanSegments.length; segmentId++) {
        for (tansId = 0; tansId < currentTans.length; tansId++) {
            var otherSegments = currentTans[tansId].getSegments();
            for (var otherSegmentsId = 0; otherSegmentsId < otherSegments.length; otherSegmentsId++) {
                if (tanSegments[segmentId].intersects(otherSegments[otherSegmentsId])) {
                    return false;
                }
            }
        }
    }
    /* Check if placement of newTan results in a tangram with a to large range
     * assuming that tangrams with a too large range are not interesting */
    var newTans = currentTans.slice(0);
    newTans[currentTans.length] = newTan;
    var boundingBox = computeBoundingBox(newTans);
    if (boundingBox[2].dup().subtract(boundingBox[0]).compare(range) > 0
        || boundingBox[3].dup().subtract(boundingBox[1]).compare(range) > 0) {
        return false;
    }
    return true;
};

const generateTangram = function(random: () => number): Tangram {
    /* Generate an order in which the tan pieces are to be placed and an orientation
     * for each piece */
    var flipped = Math.floor(random() * 2);
    var tanOrder = [0, 0, 1, 2, 2, 3, 4 + flipped];
    console.log(tanOrder);
    tanOrder = shuffleArray(tanOrder, random);
    var orientations = [];
    for (var tanId = 0; tanId < 7; tanId++) {
        orientations[tanId] = Math.floor((random() * numOrientations));
    }
    /* Place the first tan, as defined in tanOrder, at the center the drawing space */
    var tans = [];
    var anchor = new Point(new IntAdjoinSqrt2(30, 0), new IntAdjoinSqrt2(30, 0));
    tans[0] = new Tan(tanOrder[0], anchor, orientations[0]);
    /* For each remaining piece to be placed, determine one of the points of the
     * outline of the already placed pieces as the connecting point to the new
     * piece */
    for (tanId = 1; tanId < 7; tanId++) {
        var allPoints = getAllPoints(tans);
        var tanPlaced = false;
        var counter = 0;
        while (!tanPlaced) {
            anchor = allPoints[Math.floor(random() * allPoints.length)].dup();
            /* Try each possible point of the new tan as a connecting points and
             * take the first one that does not result in an overlap */
            var pointId = 0;
            var pointOrder = (tanOrder[tanId] < 3) ? [0, 1, 2] : [0, 1, 2, 3];
            pointOrder = shuffleArray(pointOrder, random);
            do {
                var newTan;
                /* If the connecting point is not the anchor, the anchor position
                 * has to be calculated from the direction vectors for that tan
                 * type and orientation */
                if (pointOrder[pointId] === 0) {
                    newTan = new Tan(tanOrder[tanId], anchor, orientations[tanId]);
                } else {
                    var tanAnchor = anchor.dup().subtract(Directions[tanOrder[tanId]]
                    [orientations[tanId]][pointOrder[pointId] - 1]);
                    newTan = new Tan(tanOrder[tanId], tanAnchor, orientations[tanId]);
                }
                /* Place the tan if it does not overlap with already placed tans */
                if (checkNewTan(tans, newTan)) {
                    tans[tanId] = newTan;
                    tanPlaced = true;
                }
                pointId++;
            } while (!tanPlaced && pointId < ((tanOrder[tanId] < 3) ? 3 : 4));
            /* Try again if process has run into infinity loop -> choose new
             * connecting point */
            counter++;
            if (counter > 100) {
                console.log("Infinity loop!");
                return generateTangram(random);
            }
        }
    }
    return new Tangram(tans);
};

const normalizeProbability = function(distribution: number[]) {
    var sum = 0;
    for (var index = 0; index < distribution.length; index++) {
        sum += distribution[index];
    }
    if (numberEq(sum, 0)) return;
    for (index = 0; index < distribution.length; index++) {
        distribution[index] /= sum;
    }
    return distribution;
};

const computeOrientationProbability = function(tans: Tan[], point: Point, tanType: number, pointId: number, allSegments: LineSegment[]) {
    var distribution = [];
    var segmentDirections = [];
    /* Get directions of the segments that are adjacent with the given connecting
     * point in a way that the directions point to the respective other point */
    for (var segmentId = 0; segmentId < allSegments.length; segmentId++) {
        if (allSegments[segmentId].point1.eq(point)) {
            segmentDirections.push(allSegments[segmentId].direction());
        } else if (allSegments[segmentId].point2.eq(point)) {
            segmentDirections.push(allSegments[segmentId].direction().neg());
        }
    }
    /* Segments align is the direction vectors are a multiple of each other */
    for (var orientId = 0; orientId < numOrientations; orientId++) {
        distribution.push(1);
        for (segmentId = 0; segmentId < segmentDirections.length; segmentId++) {
            if (segmentDirections[segmentId].multipleOf(SegmentDirections[tanType][orientId][pointId][0])) {
                distribution[orientId] += increaseProbability;
            }
            if (segmentDirections[segmentId].multipleOf(SegmentDirections[tanType][orientId][pointId][1])) {
                distribution[orientId] += increaseProbability;
            }
        }
    }
    return normalizeProbability(distribution);
};

const sampleOrientation = function(distribution: number[], random: () => number) {
    /* Generate value between 0 and 1 */
    var sample = random();
    /* Successively compute accumulated distribution and return if sample is
     * smaller than the accumulated value -> then falls into the interval for
     * that index */
    distribution = distribution.slice(0);
    if (sample < distribution[0]) return 0;
    for (var index = 1; index < numOrientations; index++) {
        distribution[index] += distribution[index - 1];
        if (sample <= distribution[index]) {
            return index;
        }
    }
    return numOrientations - 1;
};

const updatePoints = function(currentPoints: Point[], newTan: Tan) {
    var newPoints = newTan.getPoints();
    currentPoints = currentPoints.concat(newPoints);
    return eliminateDuplicates(currentPoints, comparePoints, true);
};

const updateSegments = function(currentSegments: LineSegment[], newTan: Tan) {
    /* Only the points of the new Tan can split any of the already present segments */
    var newPoints = newTan.getPoints();
    var allSegments: LineSegment[] = [];
    /* Check for each segment if it should be split by any of the new points */
    for (var segmentId = 0; segmentId < currentSegments.length; segmentId++) {
        var splitPoints = [];
        for (var pointId = 0; pointId < newPoints.length; pointId++) {
            if (currentSegments[segmentId].onSegment(newPoints[pointId])) {
                splitPoints.push(newPoints[pointId]);
            }
        }
        allSegments = allSegments.concat(currentSegments[segmentId].split(splitPoints));
    }
    /* Add the segments of the new tan and than delete duplicates */
    allSegments = allSegments.concat(newTan.getSegments());
    allSegments = eliminateDuplicates(allSegments, compareLineSegments, true);
    return allSegments;
};

const generateTangramEdges = function(random: () => number): Tangram {
    /* Generate an order in which the tan pieces are to be placed and decide on
     * whether the parallelogram is flipped or not */
    var flipped = Math.floor(random() * 2);
    var tanOrder = [0, 0, 1, 2, 2, 3, 4 + flipped];
    tanOrder = shuffleArray(tanOrder, random);
    var orientation = Math.floor((random() * numOrientations));
    /* Place the first tan, as defined in tanOrder, at the center the drawing space
     * with the just sampled orientation */
    var tans = [];
    var anchor = new Point(new IntAdjoinSqrt2(30, 0), new IntAdjoinSqrt2(30, 0));
    tans[0] = new Tan(tanOrder[0], anchor, orientation);
    var allPoints = tans[0].getPoints();
    var allSegments = tans[0].getSegments();
    for (var tanId = 1; tanId < 7; tanId++) {
        var tanPlaced = false;
        var counter = 0;
        while (!tanPlaced) {
            /* Choose point at which new tan is to be attached */
            anchor = allPoints[Math.floor(random() * allPoints.length)].dup();
            /* Choose point of the new tan that will be attached to that point */
            var pointId = 0;
            var pointOrder = (tanOrder[tanId] < 3) ? [0, 1, 2] : [0, 1, 2, 3];
            pointOrder = shuffleArray(pointOrder, random);
            do {
                var newTan;
                /* Compute probability distribution for orientations */
                var orientationDistribution = computeOrientationProbability(tans, anchor,
                    tanOrder[tanId], pointOrder[pointId], allSegments);
                /* Sample a new orientation */
                while (typeof orientationDistribution != 'undefined' && !tanPlaced) {
                    orientation = sampleOrientation(orientationDistribution, random);
                    if (pointOrder[pointId] === 0) {
                        newTan = new Tan(tanOrder[tanId], anchor, orientation);
                    } else {
                        var tanAnchor = anchor.dup().subtract(Directions[tanOrder[tanId]]
                        [orientation][pointOrder[pointId] - 1]);
                        newTan = new Tan(tanOrder[tanId], tanAnchor, orientation);
                    }
                    if (checkNewTan(tans, newTan)) {
                        tans[tanId] = newTan;
                        tanPlaced = true;
                        allPoints = updatePoints(allPoints, newTan);
                        allSegments = updateSegments(allSegments, newTan);
                    }
                    /* Set probability of the just failed orientation to 0, so it
                     * is not chosen again */
                    orientationDistribution[orientation] = 0;
                    orientationDistribution = normalizeProbability(orientationDistribution);
                }
                pointId++;
            } while (!tanPlaced && pointId < ((tanOrder[tanId] < 3) ? 3 : 4));
            counter++;
            /* Try again - can this ever happen? */
            if (counter > 100) {
                console.log("Infinity loop!");
                return generateTangramEdges(random);
            }
        }
    }
    return new Tangram(tans);
};
export function generateTangrams(count: number, onProgress?: (index: number) => void, random = createRandom()): Tangram[] {
    if (!Number.isSafeInteger(count) || count < 0) throw new RangeError("Count must be a nonnegative safe integer");
    setGenerating(true);
    try {
        const generated: Tangram[] = [];
        for (let index = 0; index < count; index++) {
            const tangram = generateTangramEdges(random);
            generated.push(tangram);
            onProgress?.(index);
            for (const tan of tangram.tans) { delete tan.points; delete tan.segments; delete tan.insidePoints; }
        }
        return generated.sort(compareTangrams);
    } finally { setGenerating(false); }
}
export { Tangram } from "./tangram.js";
export { Tan } from "./tan.js";
export { Point } from "./point.js";
export { IntAdjoinSqrt2 } from "./intadjoinsqrt2.js";
export { createRandom } from "./random.js";
