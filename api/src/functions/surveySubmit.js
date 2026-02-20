const { app } = require("@azure/functions");
const { ensureTable } = require("./shared");

app.http("surveySubmit", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "survey/submit",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { q1, q2, q3, q3why, q4, q5, q6, q7, q8 } = body;

      // Check if survey is open
      const stateClient = await ensureTable("SurveyState");
      try {
        const state = await stateClient.getEntity("survey", "state");
        if (!state.isOpen) {
          return { status: 403, jsonBody: { error: "Survey is currently closed." } };
        }
      } catch (e) {
        if (e.statusCode === 404) {
          return { status: 403, jsonBody: { error: "Survey is currently closed." } };
        }
        throw e;
      }

      if (!q1 || !q2 || !q4 || !q5 || !q6 || !q7) {
        return { status: 400, jsonBody: { error: "All questions must be answered." } };
      }

      if (q6 < 1 || q6 > 5 || !Number.isInteger(q6)) {
        return { status: 400, jsonBody: { error: "Satisfaction rating must be 1-5." } };
      }

      const client = await ensureTable("SurveyResponses");
      const suffix = Math.random().toString(36).substring(2, 8);
      const now = new Date().toISOString();

      await client.createEntity({
        partitionKey: "survey",
        rowKey: `${now}_${suffix}`,
        q1, q2, q3, q4, q5,
        q3why: (q3why || '').substring(0, 500),
        q6: q6.toString(),
        q7,
        q8: (q8 || '').substring(0, 5000),
        submittedAt: now,
      });

      return { jsonBody: { success: true, message: "Thank you for your feedback!" } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
