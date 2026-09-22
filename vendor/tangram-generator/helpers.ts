
import { createRandom } from "./random.js";

export let generating = true;

export const toRadians = function(degrees: number) {
    return degrees * Math.PI / 180.0;
};

export const toDegrees = function(radians: number) {
    return radians * 180.0 / Math.PI;
};

export const clipAngle = function(angle: number) {
    if (angle < 0) {
        while (angle < 0) {
            angle += 360;
        }
    } else if (angle >= 360) {
        while (angle >= 360) {
            angle -= 360;
        }
    }
    return angle;
};

export const numberEq = function(a: unknown, b: unknown) {
    return Math.abs(Number(a) - Number(b)) < 0.000000000001;
};

export const numberRange = function(a: number, b: number, range: number) {
    return Math.abs(a - b) < range;
};

export const numberNEq = function(a: unknown, b: unknown) {
    return !numberEq(a, b);
};

export const crossProduct3D = function(a: number[], b: number[]) {
    if (a.length != 3 || b.length != 3) {
        return [0, 0, 0];
    }
    var result = [];
    result[0] = a[1] * b[2] - a[2] * b[1];
    result[1] = a[2] * b[0] - a[0] * b[2];
    result[2] = a[0] * b[1] - a[1] * b[0];
    return result;
};

export const shuffleArray = function <T>(array: T[], random = createRandom()) {
    var elementsLeft = array.length;
    var elementCopy, index;
    /* while there are still element left */
    while (elementsLeft) {
        /* Pick one of the remaining elements (index between 0 and elementsLeft -1 */
        index = Math.floor(random() * elementsLeft);
        elementsLeft--;
        /* Switch the chosen element with the one at index elementsLeft, this
         * results in filling the array with randomly chosen elements from the back */
        elementCopy = array[elementsLeft];
        array[elementsLeft] = array[index];
        array[index] = elementCopy;
    }
    return array;
};

export const eliminateDuplicates = function <T>(array: T[], compareFunction: (a: T, b: T) => number, keepDoubles: boolean) {
    array = array.sort(compareFunction);
    var newArray = [array[0]];
    for (var index = 1; index < array.length; index++) {
        newArray.push(array[index]);
        if (compareFunction(array[index], array[index - 1]) === 0) {
            newArray.pop();
            /* Throw the other part of the duplicate away as well */
            if (!keepDoubles) {
                newArray.pop();
            }
        }
    }
    return newArray;
};

export const arrayEq = function <T>(arrayA: T[], arrayB: T[], compareFunction: (a: T, b: T) => number) {
    if (arrayA.length != arrayB.length) {
        return false;
    }
    arrayA = arrayA.slice(0).sort(compareFunction);
    arrayB = arrayB.slice(0).sort(compareFunction);
    for (var index = 0; index < arrayA.length; index++) {
        if (compareFunction(arrayA[index], arrayB[index]) != 0) {
            return false;
        }
    }
    return true;
};

export const numUniqueElements = function <T>(array: T[], compareFunction: (a: T, b: T) => number) {
    var unique = eliminateDuplicates(array.slice(0), compareFunction, true);
    return array.length;
};

export function setGenerating(value: boolean) { generating = value; }
