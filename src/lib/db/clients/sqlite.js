// Copyright (c) 2015 The SQLECTRON Team

import _ from 'lodash'
import sqlite3 from 'sqlite3';
import { identify } from 'sql-query-identifier';
import knexlib from 'knex'
import rawLog from 'electron-log'
import { genericSelectTop } from './utils';

const log = rawLog.scope('sqlite')
const logger = () => log

const knex = knexlib({ client: 'sqlite3'})

const sqliteErrors = {
  CANCELED: 'SQLITE_INTERRUPT',
}; 


export default async function (server, database) {
  const dbConfig = configDatabase(server, database);
  logger().debug('create driver client for sqlite3 with config %j', dbConfig);

  const conn = { dbConfig };

  // light solution to test connection with with the server
  await driverExecuteQuery(conn, { query: 'SELECT sqlite_version()' });

  return {
    wrapIdentifier,
    disconnect: () => disconnect(conn),
    listTables: () => listTables(conn),
    listViews: () => listViews(conn),
    listMaterializedViews: () => [],
    listRoutines: () => listRoutines(conn),
    listTableColumns: (db, table) => listTableColumns(conn, db, table),
    listTableTriggers: (table) => listTableTriggers(conn, table),
    listTableIndexes: (db, table) => listTableIndexes(conn, db, table),
    listSchemas: () => listSchemas(conn),
    getTableReferences: (table) => getTableReferences(conn, table),
    getPrimaryKey: (db, table) => getPrimaryKey(conn, db, table),
    getTableKeys: (db, table) => getTableKeys(conn, db, table),
    query: (queryText) => query(conn, queryText),
    updateValues: (updates) => updateValues(conn, updates),
    deleteRows: (updates) => deleteRows(conn, updates),
    applyChanges: (changes) => applyChanges(conn, changes),
    executeQuery: (queryText) => executeQuery(conn, queryText),
    listDatabases: () => listDatabases(conn),
    selectTop: (table, offset, limit, orderBy, filters) => selectTop(conn, table, offset, limit, orderBy, filters),
    getQuerySelectTop: (table, limit) => getQuerySelectTop(conn, table, limit),
    getTableCreateScript: (table) => getTableCreateScript(conn, table),
    getViewCreateScript: (view) => getViewCreateScript(conn, view),
    getRoutineCreateScript: (routine) => getRoutineCreateScript(conn, routine),
    truncateAllTables: () => truncateAllTables(conn),
  };
}


export function disconnect() {
  // SQLite does not have connection poll. So we open and close connections
  // for every query request. This allows multiple request at same time by
  // using a different thread for each connection.
  // This may cause connection limit problem. So we may have to change this at some point.
  return Promise.resolve();
}


export function wrapIdentifier(value) {
  if (value === '*') return value;
  const matched = value.match(/(.*?)(\[[0-9]\])/); // eslint-disable-line no-useless-escape
  if (matched) return wrapIdentifier(matched[1]) + matched[2];
  return `"${value.replace(/"/g, '""')}"`;
}


export function getQuerySelectTop(client, table, limit) {
  return `SELECT * FROM ${wrapIdentifier(table)} LIMIT ${limit}`;
}

export async function selectTop(conn, table, offset, limit, orderBy, filters) {
  return genericSelectTop(conn, table, offset, limit, orderBy, filters, driverExecuteQuery)

}

export function query(conn, queryText) {
  let queryConnection = null;

  return {
    execute() {
      return runWithConnection(conn, async (connection) => {
        try {
          queryConnection = connection;

          const result = await executeQuery({ connection }, queryText);

          return result;
        } catch (err) {
          if (err.code === sqliteErrors.CANCELED) {
            err.sqlectronError = 'CANCELED_BY_USER';
          }

          throw err;
        }
      });
    },

    async cancel() {
      if (!queryConnection) {
        throw new Error('Query not ready to be canceled');
      }

      queryConnection.interrupt();
    },
  };
}

export async function updateValues(conn, updates) {
  const updateCommands = updates.map(update => {
    return {
      query: `UPDATE ${update.table} SET ${update.column} = ? WHERE ${update.pkColumn} = ?`,
      params: [update.value, update.primaryKey]
    }
  })

  const commands = [{ query: 'BEGIN'}, ...updateCommands];
  const results = []
  // TODO: this should probably return the updated values
  await runWithConnection(conn, async (connection) => {
    const cli = { connection }
    try {
      for (let index = 0; index < commands.length; index++) {
        const blob = commands[index];
        await driverExecuteQuery(cli, blob)
      }

      const returnQueries = updates.map(update => {
        return {
          query: `select * from "${update.table}" where "${update.pkColumn}" = ?`,
          params: [
            update.primaryKey
          ]
        }
      })

      for (let index = 0; index < returnQueries.length; index++) {
        const blob = returnQueries[index];
        const r = await driverExecuteQuery(cli, blob)
        if (r.data[0]) results.push(r.data[0])
      }
      await driverExecuteQuery(cli, { query: 'COMMIT'})
    } catch (ex) {
      log.error("query exception: ", ex)
      await driverExecuteQuery(cli, { query: 'ROLLBACK' });
      throw ex
    }
  })
  return results
}

export async function deleteRows(conn, updates) {
  const deleteCommands = updates.map(update => {
    let where = {}
    where[update.pkColumn] = update.primaryKey
    return knex(update.table)
      .withSchema(update.schema)
      .where(where)
      .delete()
      .toQuery()
  })
  
  const commands = [{ query: 'BEGIN'}, ...deleteCommands];
  // TODO: this should probably return the updated values
  await runWithConnection(conn, async (connection) => {
    const cli = { connection }
    try {
      for (let index = 0; index < commands.length; index++) {
        const blob = commands[index];
        await driverExecuteQuery(cli, blob)
      }
      await driverExecuteQuery(cli, { query: 'COMMIT'})
    } catch (ex) {
      log.error("query exception: ", ex)
      await driverExecuteQuery(cli, { query: 'ROLLBACK' });
      throw ex
    }
  })

  return true
}

export async function applyChanges(conn, changes) {
  
  let result = {
    inserts: null,
    updates: null,
    deletes: null
  }

  // TODO Execute inserts

  // Execute updates
  if (changes.updates.length > 0) {
    result.updates = await updateValues(conn, changes.updates)
  }

  // Execute deletes
  if (changes.deletes.length > 0) {
    result.deletes = await deleteRows(conn, changes.deletes)
  }

  return result
}

export async function executeQuery(conn, queryText) {
  const result = await driverExecuteQuery(conn, { query: queryText, multiple: true });

  return result.map(parseRowQueryResult);
}


export async function listTables(conn) {
  const sql = `
    SELECT name
    FROM sqlite_master
    WHERE type='table'
    ORDER BY name
  `;

  const { data } = await driverExecuteQuery(conn, { query: sql });

  return data;
}

export async function listViews(conn) {
  const sql = `
    SELECT name
    FROM sqlite_master
    WHERE type = 'view'
  `;

  const { data } = await driverExecuteQuery(conn, { query: sql });

  return data;
}

export function listRoutines() {
  return Promise.resolve([]); // DOES NOT SUPPORT IT
}

async function listTableColumnsSimple(conn, database, table) {
  const sql = `PRAGMA table_info('${table}')`;

  const { data } = await driverExecuteQuery(conn, { query: sql });

  return data.map((row) => ({
    tableName: table,
    columnName: row.name,
    dataType: row.type,
  }));

}

export async function listTableColumns(conn, database, table) {
  if (table) {
    return await listTableColumnsSimple(conn, database, table)
  }
  const allTables = (await listTables(conn)) || []
  const allViews = (await listViews(conn)) || []
  const tables = allTables.concat(allViews)
  const sql = tables.map(table => {
    return `PRAGMA table_info(${table.name})`
  }).join(";")


  const results = await driverExecuteQuery(conn, {query: sql, multiple: true});
  const final = _.flatMap(results, (result, idx) => {
    return result.data.map(row => ({
      tableName: tables[idx].name,
      columnName: row.name,
      dataType: row.type
    }))
  })
  return final
}

export async function listTableTriggers(conn, table) {
  const sql = `
    SELECT name
    FROM sqlite_master
    WHERE type = 'trigger'
      AND tbl_name = '${table}'
  `;

  const { data } = await driverExecuteQuery(conn, { query: sql });

  return data.map((row) => row.name);
}

export async function listTableIndexes(conn, database, table) {
  const sql = `PRAGMA INDEX_LIST('${table}')`;

  const { data } = await driverExecuteQuery(conn, { query: sql });

  return data.map((row) => row.name);
}

export function listSchemas() {
  return Promise.resolve([]); // DOES NOT SUPPORT IT
}

export async function listDatabases(conn) {
  const result = await driverExecuteQuery(conn, { query: 'PRAGMA database_list;' });

  return result.data.map((row) => row.file || ':memory:');
}

export function getTableReferences() {
  return Promise.resolve([]); // TODO: not implemented yet
}

export async function getPrimaryKey(conn, database, table) {
  log.debug('finding foreign key for', database, table)
  const sql = `pragma table_info('${table}')`
  const { data } = await driverExecuteQuery(conn, { query: sql })
  const found = data.find(r => r.pk === 1)
  return found ? found.name : null
}

export async function getTableKeys(conn, database, table) {
  console.log("table keys")
  const sql = `pragma foreign_key_list('${table}')`
  log.debug("running SQL", sql)
  const { data } = await driverExecuteQuery(conn, { query: sql });
  log.debug("response", data)
  return data.map(row => ({
    constraintType: 'FOREIGN',
    toTable: row.table,
    fromTable: table,
    fromColumn: row.from,
    toColumn: row.to,
    onUpdate: row.on_update,
    onDelete: row.on_delete
  }))
}

export async function getTableCreateScript(conn, table) {
  const sql = `
    SELECT sql
    FROM sqlite_master
    WHERE name = '${table}';
  `;

  const { data } = await driverExecuteQuery(conn, { query: sql });

  return data.map((row) => row.sql);
}

export async function getViewCreateScript(conn, view) {
  const sql = `
    SELECT sql
    FROM sqlite_master
    WHERE name = '${view}';
  `;

  const { data } = await driverExecuteQuery(conn, { query: sql });

  return data.map((row) => row.sql);
}

export function getRoutineCreateScript() {
  return Promise.resolve([]); // DOES NOT SUPPORT IT
}

export async function truncateAllTables(conn) {
  await runWithConnection(conn, async (connection) => {
    const connClient = { connection };

    const tables = await listTables(connClient);

    const truncateAll = tables.map((table) => `
      DELETE FROM ${table.name};
    `).join('');

    // TODO: Check if sqlite_sequence exists then execute:
    // DELETE FROM sqlite_sequence WHERE name='${table}';

    await driverExecuteQuery(connClient, { query: truncateAll });
  });
}


function configDatabase(server, database) {
  return {
    database: database.database,
  };
}


function parseRowQueryResult({ data, statement, changes }) {
  // Fallback in case the identifier could not reconize the command
  const isSelect = Array.isArray(data);
  const rows = data || [];
  return {
    command: statement.type || (isSelect && 'SELECT'),
    rows,
    fields: Object.keys(rows[0] || {}).map((name) => ({ name })),
    rowCount: data && data.length,
    affectedRows: changes || 0,
  };
}


function identifyCommands(queryText) {
  try {
    return identify(queryText, { strict: false });
  } catch (err) {
    return [];
  }
}

export function driverExecuteQuery(conn, queryArgs) {
  const runQuery = (connection, { executionType, text }) => new Promise((resolve, reject) => {
    const method = resolveExecutionType(executionType);
    connection[method](text, queryArgs.params, function driverExecQuery(err, data) {
      if (err) { return reject(err); }

      return resolve({
        data,
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });

  const identifyStatementsRunQuery = async (connection) => {
    const statements = identifyCommands(queryArgs.query);

    const results = []

    // we do it this way to ensure the queries are run IN ORDER
    for (let index = 0; index < statements.length; index++) {
      const statement = statements[index];
      const r = await runQuery(connection, statement)
      results.push({...r, statement})
    }

    return queryArgs.multiple ? results : results[0];
  };

  return conn.connection
    ? identifyStatementsRunQuery(conn.connection)
    : runWithConnection(conn, identifyStatementsRunQuery);
}

function runWithConnection(conn, run) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(conn.dbConfig.database, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        db.serialize();
        const results = await run(db);
        resolve(results);
      } catch (runErr) {
        reject(runErr);
      } finally {
        db.close();
      }
    });
  });
}

function resolveExecutionType(executioType) {
  switch (executioType) {
    case 'MODIFICATION': return 'run';
    default: return 'all';
  }
}
