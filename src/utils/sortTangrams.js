export const sortTangrams = (tangramA, tangramB) => {
  return tangramA.order && tangramB.order
    ? tangramA.order - tangramB.order
    : tangramB.edges === tangramA.edges
    ? tangramB.percent - tangramA.percent
    : tangramB.edges - tangramA.edges
}
