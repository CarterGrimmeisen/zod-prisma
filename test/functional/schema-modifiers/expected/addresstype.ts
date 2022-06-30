import * as z from "zod"

export const addressTypeSchema = z.enum(["PRIVATE", "COMPANY"])
