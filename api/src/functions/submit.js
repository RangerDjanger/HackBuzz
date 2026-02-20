const { app } = require("@azure/functions");
const { ensureTable } = require("./shared");

app.http("submit", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "submit",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { name, answer } = body;

      if (!name || !answer) {
        return { status: 400, jsonBody: { error: "Name and answer are required." } };
      }

      const stateClient = await ensureTable("QuizState");
      let state;
      try {
        state = await stateClient.getEntity("quiz", "current");
      } catch (e) {
        if (e.statusCode === 404) {
          return { status: 400, jsonBody: { error: "No question available." } };
        }
        throw e;
      }

      if (!state.isOpen) {
        return { status: 400, jsonBody: { error: "Quiz is closed. Submission rejected." } };
      }

      const options = JSON.parse(state.options);
      if (!options.includes(answer)) {
        return { status: 400, jsonBody: { error: "Invalid answer option." } };
      }

      const submissionClient = await ensureTable("Submissions");
      const timestamp = new Date().toISOString();
      const rand = Math.random().toString(36).substring(2, 8);
      const rowKey = `${timestamp}-${name.replace(/[^a-zA-Z0-9]/g, "")}-${rand}`;
      const isCorrect = answer === state.correctAnswer;

      await submissionClient.upsertEntity({
        partitionKey: "submissions",
        rowKey,
        name,
        answer,
        isCorrect,
        question: state.question,
        submittedAt: timestamp,
      });

      return { jsonBody: { success: true, message: "Answer submitted!", submittedAt: timestamp } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
