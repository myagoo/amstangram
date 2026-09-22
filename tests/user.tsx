import { useContext } from "react"
import { createRoot } from "react-dom/client"
import { UserContext, UserProvider } from "../src/contexts/user"

// Observe the real provider contract; only Firebase is substituted.
function UserFixture() {
  const { initialized, currentUser } = useContext(UserContext)
  return (
    <>
      <output aria-label="Readiness">
        {initialized ? "ready" : "loading"}
      </output>
      <output aria-label="Current user">
        {currentUser === null ? "guest" : (currentUser?.username ?? "pending")}
      </output>
    </>
  )
}
createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <UserFixture />
  </UserProvider>
)
