// A deterministic external-service fixture. Tests never access real accounts or data.
const records: Record<string, Record<string, Record<string, unknown>>> = {
  users: { tester: { username: "Tester", signupDate: 1700000000000 } },
  tangrams: {
    square: {
      path: "M0 0L200 0L200 200L0 200Z",
      width: 200,
      height: 200,
      length: 800,
      edges: 4,
      category: "geometric",
      emoji: "🟦",
      uid: "tester",
      approved: true,
    },
  },
  stats: {},
}
export const account = {
  password: "fixture-current-password",
  profileUpdates: [] as Record<string, unknown>[],
}
const user = {
  uid: "tester",
  email: "tester@example.test",
  async reauthenticateWithCredential(credential: {
    email: string
    password: string
  }) {
    if (
      credential.email !== this.email ||
      credential.password !== account.password
    )
      throw Object.assign(new Error("Fixture authentication rejection"), {
        code: "auth/wrong-password",
      })
  },
  async updatePassword(password: string) {
    const code = localStorage.getItem("test-password-error")
    if (code)
      throw Object.assign(new Error("Fixture password rejection"), { code })
    account.password = password
  },
  async updateEmail(email: string) {
    const code = localStorage.getItem("test-email-error")
    if (code)
      throw Object.assign(new Error("Fixture email rejection"), { code })
    this.email = email
  },
  async updateProfile(data: Record<string, unknown>) {
    account.profileUpdates.push(data)
  },
}
// Opt in so existing single-puzzle geometry and visual baselines stay unchanged.
if (localStorage.getItem("test-two-puzzles")) {
  records.tangrams["square-copy"] = { ...records.tangrams.square }
}
if (localStorage.getItem("test-statistics")) {
  records.users.maker = { username: "Maker", signupDate: 1700000000000 }
  records.tangrams.square.uid = "maker"
  records.tangrams.zero = { ...records.tangrams.square }
  records.tangrams.pending = { ...records.tangrams.square, approved: false }
  records.stats.square = { tester: { starred: true }, maker: { starred: true } }
  records.stats.zero = { tester: { completed: 0 } }
  records.stats.pending = { tester: { completed: 123, starred: true } }
}
if (localStorage.getItem("test-large-gallery")) {
  const square = records.tangrams.square
  records.tangrams = Object.fromEntries(
    Array.from({ length: 120 }, (_, index) => [
      `gallery-${String(index).padStart(3, "0")}`,
      {
        ...square,
        category: index < 80 ? "geometric" : "stuff",
        emoji: index === 55 ? "🟩" : "🟦",
      },
    ])
  )
  records.tangrams.pending = { ...square, approved: false }
  records.stats["gallery-000"] = { tester: { completed: 0 } }
  records.stats["gallery-055"] = { tester: { starred: true } }
}
export const writes: { collection: string; data: Record<string, unknown> }[] =
  []
const snapshot = (id: string, data: Record<string, unknown>) => ({
  id,
  data: () => data,
})
type SnapshotListener = (value: { docs: ReturnType<typeof snapshot>[] }) => void
const authListeners = new Set<(value: typeof user | null) => void>()
const userListeners = new Set<SnapshotListener>()
const userSnapshot = () => ({
  docs: Object.entries(records.users).map(([id, data]) => snapshot(id, data)),
})
export const userService = {
  reads: [] as string[],
  auth(signedIn: boolean) {
    for (const callback of authListeners) callback(signedIn ? user : null)
  },
  metadata(users: typeof records.users) {
    records.users = users
    for (const callback of userListeners) callback(userSnapshot())
  },
}
const firebase = {
  auth: Object.assign(
    () => ({
      onAuthStateChanged(callback: (value: typeof user | null) => void) {
        authListeners.add(callback)
        if (!localStorage.getItem("test-manual-user"))
          queueMicrotask(() =>
            callback(localStorage.getItem("test-guest") ? null : user)
          )
        return () => {
          authListeners.delete(callback)
        }
      },
      signInWithEmailAndPassword: async () => {
        if (localStorage.getItem("test-signin-success")) {
          userService.auth(true)
          return { user }
        }
        throw Object.assign(new Error("Fixture authentication rejection"), {
          code: "auth/wrong-password",
        })
      },
    }),
    {
      EmailAuthProvider: {
        credential: (email: string, password: string) => ({ email, password }),
      },
    }
  ),
  firestore: () => ({
    collection(name: string) {
      return {
        onSnapshot(
          callback: (value: { docs: ReturnType<typeof snapshot>[] }) => void
        ) {
          if (name === "users") {
            userListeners.add(callback)
            if (!localStorage.getItem("test-manual-user"))
              queueMicrotask(() => callback(userSnapshot()))
            return () => {
              userListeners.delete(callback)
            }
          }
          queueMicrotask(() =>
            callback({
              docs: Object.entries(records[name]).map(([id, data]) =>
                snapshot(id, data)
              ),
            })
          )
          return () => {}
        },
        doc(id: string) {
          return {
            get: async () => {
              userService.reads.push(`${name}/${id}`)
              return snapshot(id, records[name][id])
            },
            set: async () => {
              throw new Error("Unexpected persistence in migration smoke test")
            },
            update: async (data: Record<string, unknown>) => {
              if (name === "users") {
                writes.push({ collection: name, data })
                Object.assign(records[name][id], data)
                for (const callback of userListeners) callback(userSnapshot())
                return
              }
              throw new Error("Unexpected persistence in migration smoke test")
            },
          }
        },
        add: async (data: Record<string, unknown>) => {
          if (name !== "tangrams")
            throw new Error("Unexpected collection write")
          writes.push({ collection: name, data })
          return { id: "new-tangram" }
        },
      }
    },
  }),
}
export default firebase
