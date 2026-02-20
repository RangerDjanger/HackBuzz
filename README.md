<p align="center">
  <img src="logo-options/logo-11-custom.svg" alt="HackBuzz" width="400">
</p>

<p align="center"><strong>Real-time quiz & survey platform for hackathon events.</strong></p>

---

**HackBuzz** is a reusable real-time quiz & survey platform for hackathon events.Run engaging live quizzes with countdown timers and winner announcements, collect anonymous participant feedback, and generate professional PDF reports — all from a single deployable app.

Built with vanilla HTML/CSS/JavaScript frontend and Azure Functions backend.

## ✨ Features

### 🎯 Live Quiz
- Admin creates/opens multiple-choice questions (2–4 options)
- 🤖 AI question generator with 90+ Azure-level questions
- Configurable countdown timer (5–120 seconds) with crossfit-style 3-2-1 beeps
- 3-second "Get Ready" countdown before questions appear
- Randomised answer order to prevent pattern-guessing
- Real-time response counter on admin dashboard
- 🏆 Winner announcement with top 3 podium, time splits, confetti & trophy animation
- ✅/❌ Correct/incorrect overlay on participant screens

### 📊 Anonymous Survey
- 8 questions with stylish chip/pill selectors
- Star rating, multi-select, and free-text fields
- Survey open/close toggle from admin panel
- One-submission-per-person via localStorage
- Hackathon participation badge on completion

### 📈 Admin Dashboard
- **Quiz tab** — Question management, live countdown, submissions, winner reveal
- **Survey Results tab** — Chart.js visualisations, written feedback display
- **Settings tab** — Organisation name, hackathon name, timer duration, customer logo upload
- 📄 PDF report export with executive summary & detailed breakdowns
- 📥 Excel export of all survey data
- 🗑️ Clear survey results with confirmation

### ⚙️ Configurable Branding
- Organisation name & hackathon name (displayed across all pages)
- Custom logo upload (shown in headers)
- All settings stored in Azure Table Storage

## Architecture

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  Static Web App  │────▶│  Azure Functions   │────▶│  Table Storage   │
│  (Frontend)      │     │  (Node.js API)     │     │  (Data)          │
│  index.html      │     │  14 endpoints      │     │  QuizState       │
│  admin.html      │     │  /api/question     │     │  Submissions     │
│  survey.html     │     │  /api/manage/*     │     │  SurveyResponses │
│                  │     │  /api/survey/*     │     │  SurveyState     │
│                  │     │  /api/settings     │     │  AppSettings     │
└──────────────────┘     └───────────────────┘     └──────────────────┘
```

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Quiz | `/index.html` | Participant view — enter name, answer questions, see results |
| Admin | `/admin.html` | Admin dashboard — manage quiz, survey, settings |
| Survey | `/survey.html` | Anonymous feedback survey with badge reward |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/question` | None | Get current question |
| POST | `/api/submit` | None | Submit a quiz answer |
| POST | `/api/manage/open` | Admin | Open a question |
| POST | `/api/manage/close` | Admin | Close current question |
| GET | `/api/manage/results` | Admin | Get quiz submissions |
| POST | `/api/manage/generate` | Admin | AI-generate a question |
| GET | `/api/settings` | None | Get app settings |
| POST | `/api/manage/settings` | Admin | Save app settings |
| GET | `/api/survey/status` | None | Check if survey is open |
| POST | `/api/survey/submit` | None | Submit survey response |
| GET | `/api/survey/results` | Admin | Get all survey responses |
| POST | `/api/manage/survey/open` | Admin | Open the survey |
| POST | `/api/manage/survey/close` | Admin | Close the survey |
| POST | `/api/manage/survey/clear` | Admin | Delete all survey data |

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

```bash
cd frontend
npx serve .
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Password for admin API endpoints | (set your own) |
| `TABLE_STORAGE_CONNECTION` | Azure Table Storage connection string | `UseDevelopmentStorage=true` |
| `AzureWebJobsStorage` | Azure Functions storage connection | `UseDevelopmentStorage=true` |

## How It Works

1. Admin logs into `/admin.html` and configures settings (org name, timer, logo)
2. Admin creates or AI-generates a question and clicks **Open Question**
3. Participants on `/index.html` see a 3-2-1 countdown, then the question with a timed countdown bar
4. Participants select an answer and submit — responses are tracked with millisecond precision
5. Timer expires → question auto-closes → admin sees top 3 winners with trophy celebration
6. Participants see ✅ or ❌ overlay showing if they got it right
7. After the quiz, admin opens the survey toggle
8. Participants complete the anonymous survey at `/survey.html` and earn a badge
9. Admin exports results as PDF report or Excel spreadsheet

## Deployment

See [DEPLOY.md](DEPLOY.md) for full Azure deployment instructions.

## License

© 2026 Microsoft Customer Success
