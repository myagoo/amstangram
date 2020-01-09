import ImageTracer from "imagetracerjs";
import paper from "paper/dist/paper-core";
import { MouseJoint, Polygon, Vec2, World } from "planck-js";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { View } from "./components/view";

const SCALE = 30;
const WALL_WIDTH = 10;
const FPS = 60;

const STROKE_WIDTH = 2;
function createTrianglePoints(size) {
  return [
    { x: 0, y: 0 },
    { x: size * 2, y: 0 },
    { x: size, y: size }
  ];
}

function createSquarePoints(size) {
  return [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size }
  ];
}

function createInvertedRhombusPoints(size) {
  return [
    { x: size, y: 0 },
    { x: size * 3, y: 0 },
    { x: size * 2, y: size },
    { x: 0, y: size }
  ];
}

function createRhombusPoints(size) {
  return [
    { x: 0, y: 0 },
    { x: size * 2, y: 0 },
    { x: size * 3, y: size },
    { x: size, y: size }
  ];
}

export const Tangram = ({ onSave, patternImageDataUrl }) => {
  const canvasRef = useRef();

  const piecesRef = useRef();
  const worldRef = useRef();
  const patternsRef = useRef();

  useEffect(() => {
    if (patternImageDataUrl) {
      const canvas = document.createElement("canvas");
      canvas.width = canvasRef.current.width;
      canvas.height = canvasRef.current.height;

      const context = canvas.getContext("2d");
      const image = new Image();

      image.onload = function() {
        context.drawImage(image, 0, 0); // Or at whatever offset you like
      };

      image.src = patternImageDataUrl;

      const options = {
        numberofcolors: 2,
        qtres: 0,
        ltres: 1,
        rightangleenhance: true,
        pathomit: 8
      };

      setTimeout(() => {
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        var traceData = ImageTracer.imagedataToTracedata(imageData, options);

        patternsRef.current = traceData.layers[0].map(({ segments }) => {
          const path = new paper.Path(segments.map(({ x1, y1 }) => [x1, y1]));
          path.closed = true;
          path.strokeWidth = 1;
          path.strokeColor = "green";
          path.position = { x: 200, y: 200 };

          const bodyDef = {
            type: "static",
            position: {
              x: 200 / SCALE,
              y: 200 / SCALE
            }
          };

          const body = worldRef.current.createBody(bodyDef);

          const vertices = [];

          for (let i = 0; i < segments.length; i++) {
            vertices[i] = new Vec2(
              segments[i].x1 / SCALE,
              segments[i].y1 / SCALE
            );
          }

          const fixtureDef = {
            filterCategoryBits: 0x0002,
            filterMaskBits: 0x0002,
            shape: new Polygon(vertices)
          };

          body.createFixture(fixtureDef);

          return { body, path };
        });
      }, 0);

      return () => {
        patternsRef.current.forEach(({ body, path }) => {
          worldRef.current.destroyBody(body);
          path.remove();
        });
      };
    }
  }, [patternImageDataUrl]);

  function getCroppedImageDataUrl() {
    let minX, minY, maxX, maxY, aabb;

    for (let i = 0; i < piecesRef.current.length; i++) {
      aabb = piecesRef.current[i].body.getFixtureList().getAABB(0);

      if (minX === undefined || aabb.lowerBound.x < minX) {
        minX = aabb.lowerBound.x;
      }
      if (minY === undefined || aabb.lowerBound.y < minY) {
        minY = aabb.lowerBound.y;
      }
      if (maxX === undefined || aabb.upperBound.x > maxX) {
        maxX = aabb.upperBound.x;
      }
      if (maxY === undefined || aabb.upperBound.y > maxY) {
        maxY = aabb.upperBound.y;
      }
    }

    const context = canvasRef.current.getContext("2d");

    const imageData = context.getImageData(
      minX * SCALE,
      minY * SCALE,
      maxX * SCALE - minX * SCALE,
      maxY * SCALE - minY * SCALE
    );

    const pix = imageData.data;

    for (let i = 0, n = pix.length; i < n; i += 4) {
      if (pix[i + 3]) {
        pix[i] = 0; // red
        pix[i + 1] = 0; // green
        pix[i + 2] = 0; // blue
      }
    }

    const downloadCanvas = document.createElement("canvas");
    const ctx = downloadCanvas.getContext("2d");
    downloadCanvas.width = imageData.width;
    downloadCanvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    return downloadCanvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
  }

  useLayoutEffect(() => {
    let ground;

    function init() {
      const parentRect = canvasRef.current.parentElement.getBoundingClientRect();
      canvasRef.current.width = parentRect.width;
      canvasRef.current.height = parentRect.height;

      // Create an empty project and a view for the canvas:
      paper.setup(canvasRef.current);
      paper.view.autoUpdate = false;
      setupPhysics();
      setupPieces();
      paper.view.on("frame", tick);
    }

    function createPiece(points, invertedPoints) {
      var path = new paper.Path(points);
      path.strokeColor = "black";
      path.strokeWidth = STROKE_WIDTH;
      path.fillColor = paper.Color.random();
      path.closed = true;
      path.applyMatrix = false;
      path.pivot = new paper.Point(0, 0);

      const vertices = [];
      for (let i = 0; i < points.length; i++) {
        vertices[i] = new Vec2(points[i].x / SCALE, points[i].y / SCALE);
      }

      const fixtureDef = {
        density: 1000,
        friction: 0,
        restitution: 0,
        shape: new Polygon(vertices)
      };

      const bodyDef = {
        type: "dynamic",
        position: {
          x: 200 / SCALE,
          y: 200 / SCALE
        },

        linearDamping: 100.0,
        angularDamping: 100.0
      };

      const body = worldRef.current.createBody(bodyDef);
      body.createFixture(fixtureDef);

      paper.view.on("frame", function() {
        const position = body.getPosition();
        path.position = new paper.Point(position.x * SCALE, position.y * SCALE);
        path.rotation = body.getAngle() * (180 / Math.PI);
      });

      path.on("click", () => {
        if (window.event.ctrlKey) {
          if (body.getType() === "dynamic") {
            body.setType("static");
            body.setAwake(false);
          } else {
            body.setType("dynamic");
            body.setAwake(true);
          }
        }
      });

      if (invertedPoints) {
        let inverted = false;

        const invertedVertices = [];

        for (let i = 0; i < invertedPoints.length; i++) {
          invertedVertices[i] = new Vec2(
            invertedPoints[i].x / SCALE,
            invertedPoints[i].y / SCALE
          );
        }

        const invertedFixtureDef = {
          density: 1000,
          friction: 0,
          restitution: 0,
          shape: new Polygon(invertedVertices)
        };

        path.on("doubleclick", () => {
          body.destroyFixture(body.getFixtureList());
          body.createFixture(inverted ? fixtureDef : invertedFixtureDef);
          path.segments = inverted ? points : invertedPoints;
          inverted = !inverted;
        });
      }

      path.on("mousedown", function(mdEvent) {
        if (window.event.ctrlKey) {
          return;
        }
        var physicsMoveJoint;

        body.getFixtureList().setDensity(1);
        body.resetMassData();
        body.setBullet(true);

        function handleMouseMove(mmEvent) {
          const physicsPoint = new Vec2(
            mmEvent.point.x / SCALE,
            mmEvent.point.y / SCALE
          );
          if (!physicsMoveJoint) {
            const mouseJointDef = {
              bodyA: ground,
              bodyB: body,
              target: physicsPoint,
              collideConnected: true,
              maxForce: 2000 * body.getMass(),
              dampingRatio: 0
            };
            physicsMoveJoint = worldRef.current.createJoint(
              MouseJoint(mouseJointDef)
            );
          } else {
            physicsMoveJoint.setTarget(physicsPoint);
          }
        }

        function handleMouseUp() {
          paper.view.off("mousemove", handleMouseMove);
          paper.view.off("mouseup", handleMouseUp);
          if (physicsMoveJoint) {
            worldRef.current.destroyJoint(physicsMoveJoint);
          }
          body.setBullet(false);
          body.getFixtureList().setDensity(1000);
          body.resetMassData();

          patternsRef.current && check();
        }

        paper.view.on("mousemove", handleMouseMove);
        paper.view.on("mouseup", handleMouseUp);
      });

      return { body, path, points, invertedPoints };
    }

    function intersects(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
      const det = (ax2 - ax1) * (by2 - by1) - (bx2 - bx1) * (ay2 - ay1);
      if (det === 0) {
        return false;
      } else {
        const lambda =
          ((by2 - by1) * (bx2 - ax1) + (bx1 - bx2) * (by2 - ay1)) / det;
        const gamma =
          ((ay1 - ay2) * (bx2 - ax1) + (ax2 - ax1) * (by2 - ay1)) / det;
        return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
      }
    }

    function check() {
      // on verifie que points des pieces est à l'intereieuse de chaque polygon
      // on verifie que chq rayon allant vers un pt des pieces intersecte
      const startingPoint = new Vec2(0, 0);

      const patternsPoints = patternsRef.current.map(({ body }) =>
        body
          .getFixtureList()
          .getShape()
          .m_vertices.map(patternVertex => body.getWorldPoint(patternVertex))
      );

      const everyPiecePointIsWithingPattern = piecesRef.current.every(
        ({ body }) => {
          const pieceVertices = body.getFixtureList().getShape().m_vertices;
          return pieceVertices.every((pieceVertex, j) => {
            let intersect = 0;
            const piecePoint = body.getWorldPoint(pieceVertex);

            for (let i = 0; i < patternsPoints.length; i++) {
              const patternPoints = patternsPoints[i];
              let lastPatternPoint = patternPoints[patternPoints.length - 1];
              for (let j = 0; j < patternPoints.length; j++) {
                const currentPatternPoint = patternPoints[j];
                if (
                  intersects(
                    startingPoint.x,
                    startingPoint.y,
                    piecePoint.x,
                    piecePoint.y,
                    lastPatternPoint.x,
                    lastPatternPoint.y,
                    currentPatternPoint.x,
                    currentPatternPoint.y
                  )
                ) {
                  intersect++;
                }
                lastPatternPoint = currentPatternPoint;
              }
            }

            const isOdd = intersect % 2;

            return isOdd;
          });
        }
      );
      if (everyPiecePointIsWithingPattern) {
        alert("YOU WIN MOTHERFUCKER");
      }
    }

    function setupPieces() {
      const smallBase = 40;
      const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2);
      const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2);
      piecesRef.current = [
        createPiece(createTrianglePoints(smallBase)),
        createPiece(createTrianglePoints(smallBase)),
        createPiece(createTrianglePoints(mediumBase)),
        createPiece(createTrianglePoints(largeBase)),
        createPiece(createTrianglePoints(largeBase)),
        createPiece(createSquarePoints(mediumBase)),
        createPiece(
          createRhombusPoints(smallBase),
          createInvertedRhombusPoints(smallBase)
        )
      ];
    }

    function createWall(width, height, position) {
      const wallBodyDef = {
        type: "static",
        position: {
          x: position.x / SCALE,
          y: position.y / SCALE
        }
      };

      const wallBody = worldRef.current.createBody(wallBodyDef);

      const wallFixtureDef = {
        shape: new Polygon([
          new Vec2(0 / SCALE, 0 / SCALE),
          new Vec2(width / SCALE, 0 / SCALE),
          new Vec2(width / SCALE, height / SCALE),
          new Vec2(0 / SCALE, height / SCALE)
        ])
      };

      wallBody.createFixture(wallFixtureDef);

      return wallBody;
    }

    function setupPhysics() {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const gravity = new Vec2(0, 0);
      worldRef.current = new World(gravity, true);

      ground = createWall(canvasRect.width, WALL_WIDTH, { x: 0, y: 0 });
      createWall(canvasRect.width, WALL_WIDTH, {
        x: 0,
        y: canvasRect.height - WALL_WIDTH
      });
      createWall(WALL_WIDTH, canvasRect.height, { x: 0, y: 0 });
      createWall(WALL_WIDTH, canvasRect.height, {
        x: canvasRect.width - WALL_WIDTH,
        y: 0
      });
    }

    function tick() {
      paper.view.update();
      worldRef.current.step(1 / FPS, 10, 10);
      worldRef.current.clearForces();
    }

    init();
  }, []);

  return (
    <View display="flex" flex="1" position="relative">
      <View as="canvas" ref={canvasRef} position="absolute" top={0} left={0} />
      <View
        as="button"
        position="absolute"
        bottom={0}
        right={0}
        onClick={() => onSave(getCroppedImageDataUrl())}
      >
        Save
      </View>
    </View>
  );
};
