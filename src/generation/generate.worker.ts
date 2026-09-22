import paper from "paper/dist/paper-core"
import { generatePuzzle } from "./generate"

self.onmessage = (event: MessageEvent<{ edges: number; seed: string }>) => {
  const project = new paper.Project(new paper.Size(1, 1))
  try {
    self.postMessage({
      puzzle: generatePuzzle(event.data.edges, event.data.seed),
    })
  } catch {
    self.postMessage({ error: true })
  } finally {
    project.remove()
  }
}
