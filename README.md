# 🥗 Nutrition & Weight Tracker App

Una completa applicazione web per il monitoraggio della nutrizione e del peso, con un backend ASP.NET Core e un frontend React con TypeScript.

## 📋 Panoramica

Questa applicazione permette agli utenti di:
- **Tracciare l'alimentazione quotidiana** con calcolo automatico di calorie e macronutrienti
- **Monitorare il peso corporeo** con grafici di andamento e metriche BMI/FFMI
- **Cercare alimenti** tramite database USDA e OpenFoodFacts
- **Scansionare codici a barre** per identificare prodotti alimentari
- **Visualizzare progressi** verso obiettivi di peso personalizzati
- **Calcolare metabolismo basale (BMR)** e fabbisogno energetico totale (TDEE)

## 🏗️ Architettura

### Backend (.NET Core)
- **Framework**: ASP.NET Core Web API
- **Database**: SQL Server con Entity Framework Core
- **API Esterne**: USDA FoodData Central, OpenFoodFacts
- **Autenticazione**: Sistema utenti con gestione profili

### Frontend (React + TypeScript)
- **Framework**: React 19 con TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS + Material-UI
- **Charts**: MUI X-Charts per visualizzazioni
- **Barcode**: html5-qrcode per scansione codici a barre

## 🚀 Funzionalità Principali

### 🍎 Gestione Alimentazione
- Ricerca alimenti da database OpenFoodFacts
- Scansione codici a barre per identificazione prodotti
- Aggiunta manuale di alimenti personalizzati
- Calcolo automatico di calorie e macronutrienti (carboidrati, proteine, grassi)
- Tracciamento consumo giornaliero con barre di progresso

### ⚖️ Monitoraggio Peso
- Registrazione peso e altezza con calcolo BMI e FFMI
- Grafici di andamento temporale del peso
- Impostazione obiettivi di peso (perdita/mantenimento/aumento)
- Calcolo automatico del progresso verso l'obiettivo
- Visualizzazione trend mensili

### 📊 Dashboard Nutrizionale
- Panoramica calorie consumate vs obiettivo giornaliero
- Distribuzione macronutrienti con visualizzazione colorata
- Calcolo BMR (metabolismo basale) e TDEE (fabbisogno totale)
- Statistiche riepilogative personalizzate

### 👤 Gestione Utenti
- Sistema di registrazione e autenticazione
- Profili personalizzati con dati biometrici
- Impostazione livelli di attività fisica
- Obiettivi calorici personalizzati

## 📁 Struttura del Progetto

```
traker-app/
├── backend/
│   └── Api/                     # ASP.NET Core Web API
│       ├── Controllers/         # Controller API (Food, User, Weight)
│       ├── model/
│       │   └── Entities/        # Modelli del database
│       ├── Services/            # Servizi business logic
│       ├── Interfaces/          # Interfacce servizi
│       └── Migrations/          # Migrazioni database EF Core
└── tracker_app/                 # React Frontend
    ├── src/
    │   ├── components/          # Componenti React riutilizzabili
    │   ├── pages/               # Pagine principali dell'app
    │   ├── api/                 # Client API per backend
    │   ├── hooks/               # Custom React hooks
    │   ├── types/               # Definizioni TypeScript
    │   └── utils/               # Utility e calcoli
    └── public/                  # Asset statici
```

## 🛠️ Tecnologie Utilizzate

### Backend
- **ASP.NET Core 8** - Framework web API
- **Entity Framework Core** - ORM per database
- **SQL Server** - Database relazionale
- **Swagger** - Documentazione API
- **HttpClient** - Chiamate API esterne

### Frontend
- **React 19** - Libreria UI
- **TypeScript** - Tipizzazione statica
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **Material-UI (MUI)** - Componenti UI e grafici
- **React Router** - Routing lato client
- **Lucide React** - Libreria icone

### API Esterne
- **USDA FoodData Central** - Database nutrizionale americano
- **OpenFoodFacts** - Database prodotti alimentari globale

## 🗄️ Schema Database

### Entità Principali
- **User**: Informazioni utente e impostazioni
- **Food**: Alimenti con valori nutrizionali
- **UserFood**: Alimenti consumati dall'utente
- **Misuration**: Misurazioni peso/altezza dell'utente
- **Activity**: Attività fisiche
- **Category**: Categorie di attività

### Relazioni
- User 1:N Misuration (storico peso)
- User 1:N Activity (attività fisiche)
- User N:N Food (tramite UserFood)

## 🚀 Setup e Installazione

### Prerequisiti
- .NET 8 SDK
- Node.js 18+
- SQL Server (LocalDB o Server)

### Backend Setup
```bash
cd backend/Api
# Configurare connection string in appsettings.json
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend Setup
```bash
cd tracker_app
npm install
npm run dev
```

### Configurazione API Keys
Aggiungere in `backend/Api/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TrackerAppDb;Trusted_Connection=true;"
  },
  "FoodApiKey": "YOUR_USDA_API_KEY"
}
```

## 📡 API Endpoints

### Food Controller
- `GET /food/search/usa/{query}` - Ricerca alimenti USDA
- `GET /food/search/eu/{query}` - Ricerca prodotti OpenFoodFacts
- `GET /food/barcode/{barcode}` - Ricerca per codice a barre
- `POST /food/user/add` - Aggiungere alimento al diario

### User Controller
- `POST /users/register` - Registrazione utente
- `POST /users/login` - Login utente
- `GET /users/{id}/info` - Informazioni utente
- `GET /users/{id}/calories/today` - Calorie giornaliere

### Weight Controller
- `GET /weight/user/{userId}` - Dati peso utente
- `POST /weight/add` - Aggiungere misurazione peso

## 📱 Screenshots e UI

L'applicazione presenta:
- **Dashboard principale** con panoramica nutrizione e peso
- **Pagina ricerca alimenti** con scanner codici a barre
- **Pagina monitoraggio peso** con grafici interattivi
- **Sistema di autenticazione** con registrazione completa
- **Design responsive** ottimizzato per mobile e desktop



## 🐛 Bug Reports

Per segnalare bug o richiedere nuove funzionalità, apri una issue nel repository GitHub.
