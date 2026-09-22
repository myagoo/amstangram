import { IntAdjoinSqrt2 } from "./intadjoinsqrt2.js";
import { Point } from "./point.js";
import { computeOutline, computeBoundingBox, Tan } from "./tan.js";
import { Evaluation } from "./evaluation.js";

export class Tangram {
    tans: Tan[]; outline: Point[][] | undefined; evaluation?: Evaluation;
    constructor(tans: Tan[]) {
        this.tans = tans.sort(function(a, b) {
            return a.tanType - b.tanType;
        });
        /* Outline is an array of points describing the outline of the tangram */
        this.outline = computeOutline(this.tans, true);
        if (typeof this.outline != 'undefined') {
            this.evaluation = new Evaluation(this.tans, this.outline);
        }
    }
    center() {
        var center = new Point();
        var boundingBox = computeBoundingBox(this.tans, this.outline);
        center.x = boundingBox[0].dup().add(boundingBox[2]).scale(0.5)!;
        center.y = boundingBox[1].dup().add(boundingBox[3]).scale(0.5)!;
        return center;
    }

    positionCentered() {
        var center = new Point(new IntAdjoinSqrt2(30, 0), new IntAdjoinSqrt2(30, 0));
        center.subtract(this.center());
        for (var tansId = 0; tansId < this.tans.length; tansId++) {
            this.tans[tansId].anchor.translate(center.x, center.y);
        }
        this.outline = computeOutline(this.tans, true);
    }
}

export const compareTangrams = function(tangramA: Tangram, tangramB: Tangram) {
    return tangramA.evaluation!.getValue() - tangramB.evaluation!.getValue();
};
