import { useMemo } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  body?: any;
}

class APIController {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Funzione privata per effettuare le chiamate API
  private async request<T>(
    endpoint: string,
    method: HttpMethod,
    options: ApiOptions = {}
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;

    // Gestione parametri query string
    if (options.params) {
      const query = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        query.append(key, String(value));
      });
      url += `?${query.toString()}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "API request failed");
    }

    // Prova a fare il parsing del JSON, se c'è una risposta
    try {
      return (await response.json()) as T;
    } catch {
      // Se non c'è body, restituisci undefined
      return undefined as T;
    }
  }

  // Funzioni pubbliche per le chiamate API

  // Esempio: Registrazione utente
  public async registerUser(user: {
    username: string;
    nome: string;
    cognome: string;
    email: string;
    password: string;
  }) {
    return this.request("/users/register", "POST", { body: user });
  }

  // Esempio: Login utente
  public async loginUser(credentials: { username: string; password: string }) {
    return this.request("/users/login", "POST", { body: credentials });
  }

  // Esempio: Ottenere dati utente
  public async getUser(userId: number) {
    return this.request(`/users/${userId}`, "GET");
  }

  // Puoi aggiungere altre funzioni pubbliche per altre chiamate API
}

// Hook per utilizzare la classe APIController
export function useAPIController(baseUrl: string = "/api") {
  // Memoize per evitare di ricreare la classe ad ogni render
  return useMemo(() => new APIController(baseUrl), [baseUrl]);
}
