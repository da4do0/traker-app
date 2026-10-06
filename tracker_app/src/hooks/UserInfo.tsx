// hooks/useUser.ts
import { useState } from "react";

export function useUser() {
  const [userId, setUserId] = useState<number | null>(5);
  const [username, setUsername] = useState<string>("");

  return { userId, username, setUserId, setUsername };
}
