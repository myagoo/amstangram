export const getErrorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? error.code
    : undefined
