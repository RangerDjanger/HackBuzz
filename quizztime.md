You are a senior full‑stack cloud engineer.
Build a simple SunCorp Hackathon quiz web application deployed on Azure with the following requirements:
Frontend

Static website (HTML/CSS/JavaScript)
Page /index.html for participants:

Text input for Name
Displays current open question and multiple‑choice answers
Submit button
Shows confirmation or “quiz closed” message



Page /admin.html for host:

Password prompt (simple shared password)
Create / edit question and answer options
Buttons: Open Question, Close Question
Results table ordered by submission time



Backend

Azure Functions (Node.js)
HTTP endpoints:

GET /api/question
POST /api/submit
POST /api/admin/open
POST /api/admin/close
GET /api/admin/results



Enforce question open/close on server
Reject late submissions
Capture server‑side UTC timestamp

Security

Admin endpoints secured by a password in an HTTP header
Password stored as Azure Function App Setting
Participants require no authentication

Data

Azure Table Storage

One active Question row
Submissions table



Results sorted by submission timestamp ascending

Deployment

Azure Static Web Apps for frontend
Azure Functions for backend
Infrastructure as Code using Bicep
README with deployment steps

Produce:

Full source code
Bicep templates
Example environment variables
Clean, minimal UI
No Teams integration
Use Microsoft logo and Suncorp logo
No unnecessary frameworks

