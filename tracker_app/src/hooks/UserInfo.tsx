// hooks/useUser.ts
import { useState, useEffect } from "react";

export function useUser() {
  const [userId, setUser] = useState<number>(0);
  const [username, setUsername] = useState<string>("");

  return { userId, username, setUser, setUsername };
}
