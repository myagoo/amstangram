declare module "paper/dist/paper-core" {
  import paper = require("paper")
  export = paper
}

interface ClipperPoint { X: number; Y: number }
interface Window {
  ClipperLib: {
    Paths: new () => ClipperPoint[][]
    ClipperOffset: new () => {
      MiterLimit: number
      ArcTolerance: number
      AddPaths(paths: ClipperPoint[][], join: number, end: number): void
      Execute(solution: ClipperPoint[][], offset: number): void
    }
    JoinType: { jtMiter: number }
    EndType: { etClosedPolygon: number }
  }
}
