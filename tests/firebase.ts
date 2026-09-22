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
  async updateProfile(data: Record<string, unknown>) {
    account.profileUpdates.push(data)
  },
}
// Opt in so existing single-puzzle geometry and visual baselines stay unchanged.
if (localStorage.getItem("test-two-puzzles")) {
  records.tangrams["square-copy"] = { ...records.tangrams.square }
}
export const writes: { collection: string; data: Record<string, unknown> }[] =
  []
const snapshot = (id: string, data: Record<string, unknown>) => ({
  id,
  data: () => data,
})
const firebase = {
  auth: Object.assign(
    () => ({
      onAuthStateChanged(callback: (value: typeof user | null) => void) {
        queueMicrotask(() =>
          callback(localStorage.getItem("test-guest") ? null : user)
        )
        return () => {}
      },
      signInWithEmailAndPassword: async () => {
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
            get: async () => snapshot(id, records[name][id]),
            set: async () => {
              throw new Error("Unexpected persistence in migration smoke test")
            },
            update: async (data: Record<string, unknown>) => {
              if (name === "users") {
                writes.push({ collection: name, data })
                Object.assign(records[name][id], data)
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
