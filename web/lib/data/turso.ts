// Production data source stub.
//
// When the scanner ships and starts writing to Turso, swap the export in
// ./index.ts from `fixtures`-backed `data` to a Turso-backed implementation
// of the same `DataSource` interface.
//
// Example (pseudo):
//
//   import { createClient } from "@libsql/client/web";
//   const client = createClient({
//     url: process.env.TURSO_URL!,
//     authToken: process.env.TURSO_AUTH_TOKEN!,
//   });
//   export const tursoData: DataSource = {
//     async getActiveSetups() {
//       const r = await client.execute(
//         "SELECT * FROM setups WHERE status IN ('active','triggered')"
//       );
//       return r.rows.map(rowToSetup);
//     },
//     ...
//   };

export {};
