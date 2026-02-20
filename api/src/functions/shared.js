const { TableClient } = require("@azure/data-tables");

const connString = process.env.TABLE_STORAGE_CONNECTION || "UseDevelopmentStorage=true";

function getTableClient(tableName) {
  return TableClient.fromConnectionString(connString, tableName);
}

async function ensureTable(tableName) {
  const client = getTableClient(tableName);
  await client.createTable().catch(() => {});
  return client;
}

function checkAdmin(request) {
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return { status: 401, jsonBody: { error: "Unauthorized" } };
  }
  return null;
}

module.exports = { getTableClient, ensureTable, checkAdmin };
