const { app } = require("@azure/functions");
const { ensureTable, checkAdmin } = require("./shared");

// GET /api/survey/status - public, returns whether survey is open
app.http("surveyStatus", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "survey/status",
  handler: async (request, context) => {
    try {
      const client = await ensureTable("SurveyState");
      try {
        const entity = await client.getEntity("survey", "state");
        return { jsonBody: { isOpen: !!entity.isOpen } };
      } catch (e) {
        if (e.statusCode === 404) {
          return { jsonBody: { isOpen: false } };
        }
        throw e;
      }
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});

// POST /api/manage/survey/open - admin only
app.http("surveyOpen", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "manage/survey/open",
  handler: async (request, context) => {
    try {
      const authError = checkAdmin(request);
      if (authError) return authError;

      const client = await ensureTable("SurveyState");
      await client.upsertEntity({
        partitionKey: "survey",
        rowKey: "state",
        isOpen: true,
        openedAt: new Date().toISOString(),
      });

      return { jsonBody: { success: true, message: "Survey opened." } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});

// POST /api/manage/survey/close - admin only
app.http("surveyClose", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "manage/survey/close",
  handler: async (request, context) => {
    try {
      const authError = checkAdmin(request);
      if (authError) return authError;

      const client = await ensureTable("SurveyState");
      await client.upsertEntity({
        partitionKey: "survey",
        rowKey: "state",
        isOpen: false,
        closedAt: new Date().toISOString(),
      });

      return { jsonBody: { success: true, message: "Survey closed." } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});

// POST /api/manage/survey/clear - admin only, deletes all survey responses
app.http("surveyClear", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "manage/survey/clear",
  handler: async (request, context) => {
    try {
      const authError = checkAdmin(request);
      if (authError) return authError;

      const client = await ensureTable("SurveyResponses");
      const entities = client.listEntities({
        queryOptions: { filter: "PartitionKey eq 'survey'" },
      });

      let deleted = 0;
      for await (const entity of entities) {
        await client.deleteEntity(entity.partitionKey, entity.rowKey);
        deleted++;
      }

      return { jsonBody: { success: true, message: `Cleared ${deleted} survey responses.` } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
