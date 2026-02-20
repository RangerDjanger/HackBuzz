const { app } = require("@azure/functions");
const { ensureTable, checkAdmin } = require("./shared");

app.http("surveyResults", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "survey/results",
  handler: async (request, context) => {
    try {
      const authError = checkAdmin(request);
      if (authError) return authError;

      const client = await ensureTable("SurveyResponses");
      const results = [];
      const entities = client.listEntities({
        queryOptions: { filter: "PartitionKey eq 'survey'" },
      });

      for await (const entity of entities) {
        results.push({
          q1: entity.q1,
          q2: entity.q2,
          q3: entity.q3,
          q3why: entity.q3why || '',
          q4: entity.q4,
          q5: entity.q5,
          q6: parseInt(entity.q6) || 0,
          q7: entity.q7 || '',
          q8: entity.q8 || '',
          submittedAt: entity.submittedAt,
        });
      }

      results.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

      return { jsonBody: { results, total: results.length } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
