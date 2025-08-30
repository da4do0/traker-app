// hooks/useUser.ts
import { useState, useEffect } from "react";

export function useUser() {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");

  return { userId, username, setUserId, setUsername };
}
