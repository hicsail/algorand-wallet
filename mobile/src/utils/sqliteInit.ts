import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

export async function initializeSQLite() {
	const platform = Capacitor.getPlatform();
	const sqlite = new SQLiteConnection(CapacitorSQLite);

	// SQLite setup
	const ret = await sqlite.checkConnectionsConsistency();
	console.log(`after checkConnectionsConsistency ${ret.result}`);
	const isReadOnly = false;
	const isConn = (await sqlite.isConnection("db_tab3", isReadOnly)).result;
	console.log(`after isConnection ${isConn}`);
	let db;
	if (ret.result && isConn) {
	db = await sqlite.retrieveConnection("db_tab3", isReadOnly);
	} else {
	db = await sqlite.createConnection("db_tab3", false, "no-encryption", 1, isReadOnly);
	}
	console.log(`after create/retrieveConnection ${JSON.stringify(db)}`);

	await db.open();
	console.log(`db.open()`);
	const query = `
		CREATE TABLE IF NOT EXISTS test (
		id INTEGER PRIMARY KEY NOT NULL,
		public_key TEXT NOT NULL,
		private_key TEXT NOT NULL
	);
	`;
	const res = await db.execute(query);
	if (res.changes && res.changes.changes && res.changes.changes < 0) {
	throw new Error(`Error: execute failed`);
	}
	await sqlite.closeConnection("db_tab3", isReadOnly);
}