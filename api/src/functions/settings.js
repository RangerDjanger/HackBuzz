const { app } = require("@azure/functions");
const { ensureTable, checkAdmin } = require("./shared");

// GET /api/settings - public, returns app settings
app.http("getSettings", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "settings",
  handler: async (request, context) => {
    try {
      const client = await ensureTable("AppSettings");
      try {
        const entity = await client.getEntity("app", "config");
        return {
          jsonBody: {
            organisationName: entity.organisationName || "",
            hackathonName: entity.hackathonName || "",
            timerSeconds: parseInt(entity.timerSeconds) || 15,
            customerLogo: entity.customerLogo || "",
          },
        };
      } catch (e) {
        if (e.statusCode === 404) {
          return {
            jsonBody: {
              organisationName: "",
              hackathonName: "",
              timerSeconds: 15,
              customerLogo: "",
            },
          };
        }
        throw e;
      }
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});

// POST /api/manage/settings - admin only, saves settings
app.http("saveSettings", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "manage/settings",
  handler: async (request, context) => {
    try {
      const authError = checkAdmin(request);
      if (authError) return authError;

      const body = await request.json();
      const { organisationName, hackathonName, timerSeconds, customerLogo } = body;

      const timer = parseInt(timerSeconds) || 15;
      if (timer < 5 || timer > 120) {
        return { status: 400, jsonBody: { error: "Timer must be between 5 and 120 seconds." } };
      }

      const client = await ensureTable("AppSettings");
      const entity = {
        partitionKey: "app",
        rowKey: "config",
        organisationName: (organisationName || "").substring(0, 200),
        hackathonName: (hackathonName || "").substring(0, 200),
        timerSeconds: timer.toString(),
      };

      // Only update logo if provided (base64 can be large)
      if (customerLogo !== undefined) {
        // Limit to ~500KB base64
        if (customerLogo && customerLogo.length > 700000) {
          return { status: 400, jsonBody: { error: "Logo too large. Please use an image under 500KB." } };
        }
        entity.customerLogo = customerLogo || "";
      }

      await client.upsertEntity(entity);

      return { jsonBody: { success: true, message: "Settings saved." } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
