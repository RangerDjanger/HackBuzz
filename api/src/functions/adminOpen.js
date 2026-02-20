const { app } = require("@azure/functions");
const { ensureTable, checkAdmin } = require("./shared");

app.http("adminOpen", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "manage/open",
  handler: async (request, context) => {
    try {
      const authError = checkAdmin(request);
      if (authError) return authError;

      const body = await request.json();
      const { question, options, correctAnswer } = body;

      if (!question || !options || !Array.isArray(options) || options.length < 2 || options.length > 4) {
        return { status: 400, jsonBody: { error: "Question and 2–4 options are required." } };
      }

      if (!correctAnswer || !options.includes(correctAnswer)) {
        return { status: 400, jsonBody: { error: "A valid correct answer must be specified." } };
      }

      const stateClient = await ensureTable("QuizState");

      // Clear previous submissions
      const subClient = await ensureTable("Submissions");
      const entities = subClient.listEntities({ queryOptions: { filter: "PartitionKey eq 'submissions'" } });
      for await (const entity of entities) {
        await subClient.deleteEntity(entity.partitionKey, entity.rowKey);
      }

      await stateClient.upsertEntity({
        partitionKey: "quiz",
        rowKey: "current",
        question,
        options: JSON.stringify(options),
        correctAnswer,
        isOpen: true,
        openedAt: new Date().toISOString(),
      });

      return { jsonBody: { success: true, message: "Question opened." } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
