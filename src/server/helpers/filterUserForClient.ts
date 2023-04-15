import { User } from "@clerk/nextjs/dist/api"

export function filterUserForClient (user: User): {
    id: string;
    username: string | null;
    profilePicture: string;
}  {
    return { id: user.id, username: user.username, profilePicture: user.profileImageUrl}
  }