const { app } = require("@azure/functions");
const { ensureTable, checkAdmin } = require("./shared");

app.http("adminClose", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "manage/close",
  handler: async (request, context) => {
    try {
      const authError = checkAdmin(request);
      if (authError) return authError;

      const stateClient = await ensureTable("QuizState");
      try {
        const entity = await stateClient.getEntity("quiz", "current");
        entity.isOpen = false;
        await stateClient.updateEntity(entity, "Merge");
        return { jsonBody: { success: true, message: "Question closed." } };
      } catch (e) {
        if (e.statusCode === 404) {
          return { status: 400, jsonBody: { error: "No question to close." } };
        }
        throw e;
      }
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
