const { app } = require("@azure/functions");
const { ensureTable } = require("./shared");

app.http("question", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "question",
  handler: async (request, context) => {
    try {
      const client = await ensureTable("QuizState");
      try {
        const entity = await client.getEntity("quiz", "current");
        if (entity.isOpen) {
          return {
            jsonBody: {
              question: entity.question,
              options: JSON.parse(entity.options),
              isOpen: true,
              openedAt: entity.openedAt || null,
            },
          };
        }
        return { jsonBody: { isOpen: false, message: "Quiz is currently closed.", correctAnswer: entity.correctAnswer || null } };
      } catch (e) {
        if (e.statusCode === 404) {
          return { jsonBody: { isOpen: false, message: "No question available." } };
        }
        throw e;
      }
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
