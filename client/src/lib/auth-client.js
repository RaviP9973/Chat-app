import { createAuthClient } from "better-auth/react"
import { HOST } from "@/utils/constants"

export const authClient = createAuthClient({
    baseURL: HOST,
    credentials: "include",
})
