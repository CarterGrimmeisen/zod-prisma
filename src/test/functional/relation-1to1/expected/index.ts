import { UserModel } from "./user"
import { KeychainModel } from "./keychain"

export * from "./user"
export * from "./keychain"

export const db = {
  User: UserModel,
  Keychain: KeychainModel,
}
