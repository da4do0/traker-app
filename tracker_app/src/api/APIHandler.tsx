const endpointAPI = "http://localhost:5132/";
import type { User } from "../types/User";

const CALLS = [
  //LETTURA RFID
  {
    name: "Login",
    method: "POST",
    endpoint: "user/login",
    isAuthenticated: false,
  },
  {
    name: "NewUser",
    method: "POST",
    endpoint: "user",
    isAuthenticated: false,
  },
  {
    name: "CheckUser",
    method: "GET",
    endpoint: "user/",
    isAuthenticated: false,
  },
  {
    name: "InfoUser",
    method: "GET",
    endpoint: "user/info/",
    isAuthenticated: false,
  },
  {
    name: "SearchFoodQuery",
    method: "GET",
    endpoint: "food/search/eu/",
    isAuthenticated: false,
  },
  {
    name: "SearchFoodBarcode",
    method: "GET",
    endpoint: "food/product/eu/",
    isAuthenticated: false,
  },
  {
    name: "AddFood",
    method: "POST",
    endpoint: "food/add",
    isAuthenticated: false,
  },
  {
    name: "Calories",
    method: "GET",
    endpoint: "food/calories/",
    isAuthenticated: false,
  },
  {
    name: "UpdateFood",
    method: "PUT",
    endpoint: "food/update/",
    isAuthenticated: false,
  },
  {
    name: "DeleteFood",
    method: "DELETE",
    endpoint: "food/",
    isAuthenticated: false,
  },
  {
    name: "FoodList",
    method: "GET",
    endpoint: "food/list/",
    isAuthenticated: false,
  },
];

export class APIDbHandler {
  static getCall(name: string) {
    return CALLS.find((call) => call.name === name);
  }

  static async login(username: string, password: string) {
    const call = this.getCall("Login");
    let endpoint = call?.endpoint ? call.endpoint : "";
    let method = call?.method ? call.method : "";
    if (!endpoint || !method) {
      throw new Error("Call Login not found");
    }
    try {
      const response = await fetch(endpointAPI + endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Username: username,
          Password: password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Nome utente o password errati");
      }
    } catch (err) {
      throw new Error("Errore durante la richiesta di login");
    }
  }

  static async authenticatedCall(
    endpoint: string,
    method: string,
    body: Object = {}
  ): Promise<any> {
    /* showLoadingPortal(); */
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!token) throw console.error("Login Richiesto");
    if (!refreshToken) throw console.error("LOGOUT!");

    if (token) {
      const response = await fetch(endpointAPI + endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: method !== "GET" ? JSON.stringify(body) : null,
      });

      if (response.status === 401 && token) {
        let refreshResponse = await this.refreshToken(refreshToken);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem("accessToken", refreshData.accessToken);
          localStorage.setItem("refreshToken", refreshData.refreshToken);
          return this.authenticatedCall(endpoint, method, body);
        }
      } else if (!response.ok) {
        /* hideLoadingPortal(); */
        throw new Error("Errore nella chiamata autenticata");
      }

      const contentLength = response.headers.get("content-length");
      if (response.status === 204 || contentLength === "0") {
        /* hideLoadingPortal(); */
        return { status: response.status };
      }

      const contentType = response.headers.get("Content-Type");

      try {
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          /* hideLoadingPortal(); */
          return { status: response.status, data };
        }

        if (contentType && contentType.includes("text")) {
          const data = await response.text();
          /* hideLoadingPortal(); */
          return { status: response.status, data };
        }

        if (contentType && contentType.includes("application/xml")) {
          const data = await response.text();
          /* hideLoadingPortal(); */
          return { status: response.status, data };
        }

        throw new Error("Tipo di contenuto non supportato");
      } catch (error) {
        /* hideLoadingPortal(); */
        console.error("Errore nel parsing della risposta:", error);
        const textData = await response.text();
        return { status: response.status, data: textData };
      }
    }
  }

  static async refreshToken(refreshToken: string) {
    let call = this.getCall("Refresh");
    let endpoint = call?.endpoint ? call.endpoint : "";
    let method = call?.method ? call.method : "";
    return await fetch(endpointAPI + endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: refreshToken,
      }),
    });
  }

  // *************************

  static async newUser(user: User) {
    let call = this.getCall("NewUser");
    if (!call) throw new Error("Call NewUser not found");
    const response = await fetch(endpointAPI + call.endpoint, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante la registrazione");
    }
    return response.json();
  }

  static async checkUser(username: string) {
    let call = this.getCall("CheckUser");
    if (!call) throw new Error("Call CheckUser not found");
    const response = await fetch(endpointAPI + call.endpoint + username, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante il controllo dell'utente");
    }
    return response.json();
  }

  static async InfoUser(userId: number) {
    let call = this.getCall("InfoUser");
    if (!call) throw new Error("Call InfoUser not found");
    const response = await fetch(endpointAPI + call.endpoint + userId, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante il controllo dell'utente");
    }
    return response.json();
  }

  static async SearchFoodQuery(query: string) {
    let call = this.getCall("SearchFoodQuery");
    if (!call) throw new Error("Call SearchFoodQuery not found");
    const response = await fetch(endpointAPI + call.endpoint + query, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante la ricerca del cibo");
    }
    return response.json();
  }

  static async SearchFoodBarcode(barcode: string) {
    let call = this.getCall("SearchFoodBarcode");
    if (!call) throw new Error("Call SearchFoodBarcode not found");
    const response = await fetch(endpointAPI + call.endpoint + barcode, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante la ricerca del cibo");
    }
    return response.json();
  }

  static async AddFood(food: any) {
    let call = this.getCall("AddFood");
    if (!call) throw new Error("Call AddFood not found");
    const response = await fetch(endpointAPI + call.endpoint, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(food),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante l'aggiunta del cibo");
    }
    return response.json();
  }

  static async GetCalories(userId: number) {
    let call = this.getCall("Calories");
    if (!call) throw new Error("Call Calories not found");
    const response = await fetch(endpointAPI + call.endpoint + userId, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante il calcolo delle calorie");
    }
    return response.json();
  }

  static async UpdateFood(foodId: number, updateData: any) {
    let call = this.getCall("UpdateFood");
    if (!call) throw new Error("Call UpdateFood not found");
    const response = await fetch(endpointAPI + call.endpoint + foodId, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante l'aggiornamento del cibo");
    }
    return response.json();
  }

  static async DeleteFood(foodId: number) {
    let call = this.getCall("DeleteFood");
    if (!call) throw new Error("Call DeleteFood not found");
    const response = await fetch(endpointAPI + call.endpoint + foodId, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante l'eliminazione del cibo");
    }
    return response.json();
  }

  static async FoodList(userId: number) {
    let call = this.getCall("FoodList");
    if (!call) throw new Error("Call DeleteFood not found");
    const response = await fetch(endpointAPI + call.endpoint + userId, {
      method: call.method,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante l'eliminazione del cibo");
    }
    return response.json();
  }
}

/*  */
