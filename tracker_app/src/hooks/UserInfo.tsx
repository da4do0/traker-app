// hooks/useUser.ts
import { useState, useEffect } from "react";

export function useUser() {
  const [userId, setUser] = useState<number>(0);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    console.log("Stored username:", storedUsername);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return { userId, username, setUser, setUsername };
}
