const { app } = require("@azure/functions");
const { ensureTable, checkAdmin } = require("./shared");

app.http("adminResults", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "manage/results",
  handler: async (request, context) => {
    try {
      const authError = checkAdmin(request);
      if (authError) return authError;

      const subClient = await ensureTable("Submissions");
      const results = [];
      const entities = subClient.listEntities({
        queryOptions: { filter: "PartitionKey eq 'submissions'" },
      });

      for await (const entity of entities) {
        results.push({
          name: entity.name,
          answer: entity.answer,
          isCorrect: entity.isCorrect,
          question: entity.question,
          submittedAt: entity.submittedAt,
        });
      }

      results.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

      // Get the correct answer and openedAt from quiz state
      let correctAnswer = null;
      let openedAt = null;
      const stateClient = await ensureTable("QuizState");
      try {
        const state = await stateClient.getEntity("quiz", "current");
        correctAnswer = state.correctAnswer;
        openedAt = state.openedAt || null;
      } catch (e) { /* no active question */ }

      return { jsonBody: { results, correctAnswer, openedAt } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
