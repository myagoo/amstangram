import React, { useRef, useLayoutEffect } from "react";

import Box2D from "box2dweb";

import { Stage, Ticker, Shape } from "@createjs/easeljs";

import "./Tangram.scss";

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

export const Tangram = ({ onSave }) => {
  const canvasRef = useRef();
  const debugRef = useRef();
  const piecesRef = useRef();

  function getCroppedImageDataUrl() {
    let minX, minY, maxX, maxY, aabb;

    for (let i = 0; i < piecesRef.current.length; i++) {
      aabb = piecesRef.current[i].GetFixtureList().m_aabb;

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
    let stage;
    let world;
    let ground;

    function init() {
      const parentRect = canvasRef.current.parentElement.getBoundingClientRect();
      canvasRef.current.width = parentRect.width;
      canvasRef.current.height = parentRect.height;
      debugRef.current.width = parentRect.width;
      debugRef.current.height = parentRect.height;

      stage = new Stage(canvasRef.current);
      stage.enableMouseOver(FPS);
      setupPhysics();
      setupPieces();
      Ticker.addEventListener("tick", tick);
      Ticker.framerate = FPS;
    }

    function createPiece(points) {
      const shape = new Shape();

      const color = randomColor();

      shape.graphics
        .setStrokeStyle(3, "butt", "round")
        .beginStroke("#000000")
        .beginFill(color)
        .moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        shape.graphics.lineTo(points[i].x, points[i].y);
      }

      shape.graphics.closePath();

      shape.regY = 0;
      shape.regX = 0;
      shape.cursor = "pointer";

      const fixtureDef = new b2FixtureDef();
      fixtureDef.density = 1000;
      fixtureDef.friction = 0;
      fixtureDef.restitution = 0;

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

      const body = world.CreateBody(bodyDef);
      body.CreateFixture(fixtureDef);

      Ticker.addEventListener("tick", function() {
        const position = body.GetPosition();
        shape.x = position.x * SCALE;
        shape.y = position.y * SCALE;
        shape.rotation = body.GetAngle() * (180 / Math.PI);
      });

      stage.addChild(shape);

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
            physicsMoveJoint = world.CreateJoint(def);
          } else {
            physicsMoveJoint.SetTarget(physicsPoint);
          }
        }

        function handleMouseUp() {
          stage.off("stagemousemove", mouseMoveListener);
          stage.off("stagemouseup", mouseUpListener);
          world.DestroyJoint(physicsMoveJoint);
          body.SetBullet(false);
          body.GetFixtureList().SetDensity(1000);
          body.ResetMassData();
        }

        mouseMoveListener = stage.on("stagemousemove", handleMouseMove);
        mouseUpListener = stage.on("stagemouseup", handleMouseUp);
      });

      return body;
    }

    function setupPieces() {
      const smallBase = 60;
      const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2);
      const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2);
      piecesRef.current = [
        createPiece(createTrianglePoints(smallBase)),
        createPiece(createTrianglePoints(smallBase)),
        createPiece(createTrianglePoints(mediumBase)),
        createPiece(createTrianglePoints(largeBase)),
        createPiece(createTrianglePoints(largeBase)),
        createPiece(createSquarePoints(mediumBase)),
        createPiece(createRhombusPoints(smallBase))
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
      const wallBody = world.CreateBody(wallBodyDef);
      wallBody.CreateFixture(wallFixtureDef);
      return wallBody;
    }

    function setupPhysics() {
      const canvasRect = stage.canvas.getBoundingClientRect();
      const gravity = new b2Vec2(0, 0);
      world = new b2World(gravity, true);

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

      world.SetDebugDraw(debugDraw);
    }

    function tick() {
      stage.update();
      world.DrawDebugData();
      world.Step(1 / FPS, 10, 10);
      world.ClearForces();
    }

    init();
  }, []);

  return (
    <div className="tangram">
      <canvas ref={canvasRef}></canvas>
      <canvas ref={debugRef}></canvas>
      <button onClick={() => onSave(getCroppedImageDataUrl())}>Save</button>
    </div>
  );
};
