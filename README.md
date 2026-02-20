# SunCorp Hackathon Quiz App

A simple real-time quiz application for hackathon events, built with vanilla HTML/CSS/JavaScript and Azure Functions.

## Architecture

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  Static Web App  │────▶│  Azure Functions   │────▶│  Table Storage   │
│  (Frontend)      │     │  (Node.js API)     │     │  (Data)          │
│  index.html      │     │  /api/question     │     │  QuizState       │
│  admin.html      │     │  /api/submit       │     │  Submissions     │
│                  │     │  /api/admin/*      │     │                  │
└──────────────────┘     └───────────────────┘     └──────────────────┘
```

## Pages

- **`/index.html`** — Participant page: enter name, view question, select answer, submit
- **`/admin.html`** — Admin page: login, create questions, open/close, view results

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/question` | None | Get current question and options |
| POST | `/api/submit` | None | Submit an answer `{ name, answer }` |
| POST | `/api/manage/open` | Admin | Open a question `{ question, options, correctAnswer }` |
| POST | `/api/manage/close` | Admin | Close the current question |
| GET | `/api/manage/results` | Admin | Get all submissions sorted by time |

Admin endpoints require the `x-admin-password` HTTP header.

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite) (local storage emulator)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (for deployment)

## Local Development

### 1. Start Azurite (storage emulator)

```bash
npx azurite --silent --location .azurite
```

### 2. Install dependencies & start the API

```bash
cd api
npm install
npm start
```

The API runs at `http://localhost:7071`.

### 3. Serve the frontend

Use any static file server:

```bash
cd frontend
npx serve .
```

Or open `index.html` directly (update `API_BASE` in the HTML to `http://localhost:7071/api`).

## Deployment to Azure

### Quick Deploy (PowerShell)

```powershell
.\infra\deploy.ps1 -AdminPassword "suncorphack"
```

This single command will create all resources, deploy the Functions and frontend, and lock down CORS.

### Manual Steps

#### 1. Create the resource group (if it doesn't exist)

```bash
az group create --name suncorp_hack_rg --location australiaeast
```

#### 2. Deploy infrastructure with Bicep

```bash
az deployment group create \
  --resource-group suncorp_hack_rg \
  --template-file infra/main.bicep \
  --parameters adminPassword=suncorphack
```

#### 3. Deploy the Azure Functions

```bash
cd api
func azure functionapp publish <functionAppName>
```

#### 4. Deploy the frontend

```bash
SWA_TOKEN=$(az staticwebapp secrets list --name <staticWebAppName> -g suncorp_hack_rg --query "properties.apiKey" -o tsv)
npx @azure/static-web-apps-cli deploy frontend --deployment-token $SWA_TOKEN --env production
```

#### 5. Lock down CORS (optional but recommended)

```bash
az functionapp cors remove -g suncorp_hack_rg -n <funcAppName> --allowed-origins '*'
az functionapp cors add -g suncorp_hack_rg -n <funcAppName> --allowed-origins 'https://<swa-hostname>'
```

Replace `<functionAppName>`, `<staticWebAppName>`, and `<swa-hostname>` with the Bicep deployment outputs.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Password for admin API endpoints | `suncorphack` |
| `TABLE_STORAGE_CONNECTION` | Azure Table Storage connection string | `UseDevelopmentStorage=true` |
| `AzureWebJobsStorage` | Azure Functions storage connection | `UseDevelopmentStorage=true` |

## How It Works

1. Admin logs into `/admin.html` with the shared password
2. Admin creates a question with multiple-choice options and clicks **Open Question**
3. Participants on `/index.html` see the question appear (auto-polls every 3 seconds)
4. Participants enter their name, select an answer, and submit
5. Server validates the question is still open and records the submission with a UTC timestamp
6. Admin clicks **Close Question** to stop accepting submissions
7. Admin views results sorted by submission time
