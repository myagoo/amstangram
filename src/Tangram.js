import React, { useRef, useLayoutEffect, useEffect } from "react";

import Box2D from "box2dweb";

import { Stage, Ticker, Shape, Graphics } from "@createjs/easeljs";

import "./Tangram.scss";
import ImageTracer from "imagetracerjs";

const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2World = Box2D.Dynamics.b2World;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
const b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

const SCALE = 30;
const WALL_WIDTH = 10;
const FPS = 60;
const MARGIN = 10;

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
function randomColor() {
  return "hsla(" + Math.random() * 360 + ", 100%, 50%, 1)";
}

export const Tangram = ({ onSave, patternImageDataUrl }) => {
  const canvasRef = useRef();
  const debugRef = useRef();
  const piecesRef = useRef();
  const stageRef = useRef();
  const worldRef = useRef();
  const patternsRef = useRef();

  useEffect(() => {
    console.log(patternImageDataUrl);
    if (patternImageDataUrl) {
      const canvas = document.createElement("canvas");
      canvas.width = canvasRef.current.width;
      canvas.height = canvasRef.current.height;

      const context = canvas.getContext("2d");
      const img = new Image();

      img.onload = function() {
        context.drawImage(img, 0, 0); // Or at whatever offset you like
      };
      img.src = patternImageDataUrl;

      document.body.appendChild(canvas);

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
        console.log(imageData);
        console.log(
          "every pix is 0",
          imageData.data.every(pix => pix === 0)
        );
        var traceData = ImageTracer.imagedataToTracedata(imageData, options);
        console.log(traceData);

        patternsRef.current = traceData.layers[0].map(({ segments }) => {
          const graphics = new Graphics();

          graphics
            .setStrokeStyle(1)
            .beginStroke("#000000")
            .moveTo(segments[0].x1, segments[0].y1);

          for (let i = 1; i < segments.length; i++) {
            graphics.lineTo(segments[i].x1, segments[i].y1);
          }

          graphics.closePath();

          const shape = new Shape(graphics);

          shape.regY = 0;
          shape.regX = 0;
          shape.x = 200;
          shape.y = 200;
          stageRef.current.addChild(shape);

          const fixtureDef = new b2FixtureDef();
          fixtureDef.filter.categoryBits = 0x0002;
          fixtureDef.filter.maskBits = 0x0002;

          fixtureDef.shape = new b2PolygonShape();

          const vertices = [];
          for (let i = 0; i < segments.length; i++) {
            vertices[i] = new b2Vec2(
              segments[i].x1 / SCALE,
              segments[i].y1 / SCALE
            );
          }

          fixtureDef.shape.SetAsArray(vertices, vertices.length);

          const bodyDef = new b2BodyDef();
          bodyDef.type = b2Body.b2_staticBody;
          bodyDef.position.x = 200 / SCALE;
          bodyDef.position.y = 200 / SCALE;

          const body = worldRef.current.CreateBody(bodyDef);
          body.CreateFixture(fixtureDef);

          return { body, shape };
        });
      }, 0);

      return () => {
        patternsRef.current.forEach(({ body, shape }) => {
          worldRef.current.DestroyBody(body);
          stageRef.current.removeChild(shape);
        });
      };
    }
  }, [patternImageDataUrl]);

  function getCroppedImageDataUrl() {
    let minX, minY, maxX, maxY, aabb;

    for (let i = 0; i < piecesRef.current.length; i++) {
      aabb = piecesRef.current[i].body.GetFixtureList().m_aabb;

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
      minX * SCALE - MARGIN,
      minY * SCALE - MARGIN,
      maxX * SCALE - minX * SCALE + MARGIN * 2,
      maxY * SCALE - minY * SCALE + MARGIN * 2
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
      debugRef.current.width = parentRect.width;
      debugRef.current.height = parentRect.height;

      stageRef.current = new Stage(canvasRef.current);
      stageRef.current.enableMouseOver(FPS);
      setupPhysics();
      setupPieces();
      Ticker.addEventListener("tick", tick);
      Ticker.framerate = FPS;
    }

    function createPiece(points, invertedPoints) {
      const color = randomColor();
      const graphics = new Graphics();
      graphics
        .setStrokeStyle(10, "butt", "round")
        .beginStroke("#000000")
        .beginFill(color)
        .moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
      }

      graphics.closePath();

      const shape = new Shape(graphics);

      shape.regY = 0;
      shape.regX = 0;
      shape.cursor = "pointer";

      const fixtureDef = new b2FixtureDef();
      fixtureDef.density = 1000;
      fixtureDef.friction = 0;
      fixtureDef.restitution = 0;
      fixtureDef.filter.categoryBits = 0x0001;
      fixtureDef.filter.maskBits = 0x0001;

      fixtureDef.shape = new b2PolygonShape();

      const vertices = [];
      for (let i = 0; i < points.length; i++) {
        vertices[i] = new b2Vec2(points[i].x / SCALE, points[i].y / SCALE);
      }

      fixtureDef.shape.SetAsArray(vertices, vertices.length);

      const bodyDef = new b2BodyDef();
      bodyDef.type = b2Body.b2_dynamicBody;
      bodyDef.position.x = 200 / SCALE;
      bodyDef.position.y = 200 / SCALE;
      bodyDef.linearDamping = 100.0;
      bodyDef.angularDamping = 100.0;

      const body = worldRef.current.CreateBody(bodyDef);
      body.CreateFixture(fixtureDef);

      Ticker.addEventListener("tick", function() {
        const position = body.GetPosition();
        shape.x = position.x * SCALE;
        shape.y = position.y * SCALE;
        shape.rotation = body.GetAngle() * (180 / Math.PI);
      });

      stageRef.current.addChild(shape);

      if (invertedPoints) {
        let inverted = false;

        const invertedFixtureDef = new b2FixtureDef();
        invertedFixtureDef.density = 1000;
        invertedFixtureDef.friction = 0;
        invertedFixtureDef.restitution = 0;

        invertedFixtureDef.shape = new b2PolygonShape();

        const invertedVertices = [];

        for (let i = 0; i < invertedPoints.length; i++) {
          invertedVertices[i] = new b2Vec2(
            invertedPoints[i].x / SCALE,
            invertedPoints[i].y / SCALE
          );
        }

        invertedFixtureDef.shape.SetAsArray(
          invertedVertices,
          invertedVertices.length
        );

        const invertedGraphics = new Graphics();
        invertedGraphics
          .setStrokeStyle(5, "butt", "round")
          .beginStroke("#00000080")
          .beginFill(color)
          .moveTo(invertedPoints[0].x, invertedPoints[0].y);

        for (let i = 1; i < invertedPoints.length; i++) {
          invertedGraphics.lineTo(invertedPoints[i].x, invertedPoints[i].y);
        }

        invertedGraphics.closePath();

        shape.addEventListener("dblclick", () => {
          body.DestroyFixture(body.GetFixtureList());
          body.CreateFixture(inverted ? fixtureDef : invertedFixtureDef);
          shape.graphics = inverted ? graphics : invertedGraphics;
          inverted = !inverted;
        });
      }

      shape.addEventListener("mousedown", function(mdEvent) {
        var physicsMoveJoint, mouseMoveListener, mouseUpListener;

        body.GetFixtureList().SetDensity(1);
        body.ResetMassData();
        body.SetBullet(true);

        function handleMouseMove(mmEvent) {
          const physicsPoint = new b2Vec2(
            mmEvent.stageX / SCALE,
            mmEvent.stageY / SCALE
          );
          if (!physicsMoveJoint) {
            const def = new b2MouseJointDef();
            def.bodyA = ground;
            def.bodyB = body;
            def.target = physicsPoint;
            def.collideConnected = true;
            def.maxForce = 2000 * body.GetMass();
            def.dampingRatio = 0;
            physicsMoveJoint = worldRef.current.CreateJoint(def);
          } else {
            physicsMoveJoint.SetTarget(physicsPoint);
          }
        }

        function handleMouseUp() {
          stageRef.current.off("stagemousemove", mouseMoveListener);
          stageRef.current.off("stagemouseup", mouseUpListener);
          if (physicsMoveJoint) {
            worldRef.current.DestroyJoint(physicsMoveJoint);
          }
          body.SetBullet(false);
          body.GetFixtureList().SetDensity(1000);
          body.ResetMassData();

          patternsRef.current && check();
        }

        mouseMoveListener = stageRef.current.on(
          "stagemousemove",
          handleMouseMove
        );
        mouseUpListener = stageRef.current.on("stagemouseup", handleMouseUp);
      });

      return { body, shape, points, invertedPoints };
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
      const startingPoint = new b2Vec2(0, 0);

      const patternsPoints = patternsRef.current.map(({ body }) =>
        body
          .GetFixtureList()
          .GetShape()
          .GetVertices()
          .map(patternVertex => body.GetWorldPoint(patternVertex))
      );

      const everyPiecePointIsWithingPattern = piecesRef.current.every(
        ({ body, shape }, i) => {
          console.log("Checking piece ", i);
          const pieceVertices = body
            .GetFixtureList()
            .GetShape()
            .GetVertices();
          return pieceVertices.every((pieceVertex, j) => {
            console.log("Checking vertex ", j);

            let intersect = 0;
            const piecePoint = body.GetWorldPoint(pieceVertex);

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
            console.log("intersection", intersect);

            return isOdd;
          });
        }
      );
      console.log(
        "everyPiecePointIsWithingPattern",
        everyPiecePointIsWithingPattern
      );
    }

    function setupPieces() {
      const smallBase = 40;
      const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2);
      const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2);
      piecesRef.current = [
        // createPiece(createTrianglePoints(smallBase)),
        // createPiece(createTrianglePoints(smallBase)),
        // createPiece(createTrianglePoints(mediumBase)),
        createPiece(createTrianglePoints(largeBase)),
        createPiece(createTrianglePoints(largeBase))
        // createPiece(createSquarePoints(mediumBase))
        // createPiece(
        //   createRhombusPoints(smallBase),
        //   createInvertedRhombusPoints(smallBase)
        // )
      ];
    }

    function createWall(width, height, position) {
      const wallFixtureDef = new b2FixtureDef();
      const wallBodyDef = new b2BodyDef();
      wallBodyDef.type = b2Body.b2_staticBody;
      wallBodyDef.position.x = position.x / SCALE;
      wallBodyDef.position.y = position.y / SCALE;
      wallFixtureDef.shape = new b2PolygonShape();

      const vertices = [
        new b2Vec2(0 / SCALE, 0 / SCALE),
        new b2Vec2(width / SCALE, 0 / SCALE),
        new b2Vec2(width / SCALE, height / SCALE),
        new b2Vec2(0 / SCALE, height / SCALE)
      ];

      wallFixtureDef.shape.SetAsArray(vertices, vertices.length);
      const wallBody = worldRef.current.CreateBody(wallBodyDef);
      wallBody.CreateFixture(wallFixtureDef);
      return wallBody;
    }

    function setupPhysics() {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const gravity = new b2Vec2(0, 0);
      worldRef.current = new b2World(gravity, true);

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

      const debugDraw = new b2DebugDraw();
      debugDraw.SetSprite(debugRef.current.getContext("2d"));
      debugDraw.SetDrawScale(SCALE);
      debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

      worldRef.current.SetDebugDraw(debugDraw);
    }

    function tick() {
      stageRef.current.update();
      worldRef.current.DrawDebugData();
      worldRef.current.Step(1 / FPS, 10, 10);
      worldRef.current.ClearForces();
    }

    init();
  }, []);

  return (
    <div className="tangram">
      <canvas ref={canvasRef}></canvas>
      <canvas ref={debugRef}></canvas>
      <div>
        <button onClick={() => onSave(getCroppedImageDataUrl())}>Save</button>
      </div>
    </div>
  );
};
