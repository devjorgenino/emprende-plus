// In-memory mock of expo-sqlite for Jest tests.
// Plain JavaScript — no TypeScript syntax allowed.

let database = null;

function parseTableName(sql) {
  var m = sql.match(/CREATE TABLE (?:IF NOT EXISTS )?([^\s(]+)/i);
  return m ? m[1] : '';
}

function parseInsertTable(sql) {
  var m = sql.match(/INSERT INTO ([^\s(]+)/i);
  return m ? m[1] : '';
}

function parseUpdateTable(sql) {
  var m = sql.match(/UPDATE ([^\s]+)/i);
  return m ? m[1] : '';
}

function parseDeleteTable(sql) {
  var m = sql.match(/DELETE FROM ([^\s]+)/i);
  return m ? m[1] : '';
}

function bindParams(sql, params) {
  return sql.replace(/\?/g, function () {
    var v = params.shift();
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return String(v);
    return "'" + String(v).replace(/'/g, "''") + "'";
  });
}

function coerce(v) {
  if (v === 'NULL') return null;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

function matchesWhere(row, whereClause) {
  if (!whereClause) return true;
  var parts = whereClause.split(/\s+AND\s+/i);
  return parts.every(function (part) {
    var isNull = part.match(/(\w+)\s+IS\s+NULL/i);
    if (isNull) {
      return row[isNull[1]] === null || row[isNull[1]] === undefined;
    }
    var m = part.match(/(\w+)\s*=\s*(.+)/);
    if (!m) return true;
    var key = m[1];
    var val = m[2].trim().replace(/^'(.*)'$/, '$1');
    return String(row[key]) === val;
  });
}

function queryRows(sql, db) {
  if (!/^SELECT/i.test(sql)) return [];
  var fromMatch = sql.match(/FROM\s+([^\s]+)/i);
  if (!fromMatch) return [];
  var table = db.tables.get(fromMatch[1]);
  if (!table) return [];
  var rows = table.rows.slice();
  var whereMatch = sql.match(/WHERE\s+([\s\S]*?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
  if (whereMatch && whereMatch[1]) {
    rows = rows.filter(function (r) { return matchesWhere(r, whereMatch[1]); });
  }
  var orderMatch = sql.match(/ORDER\s+BY\s+([\s\S]+?)(?:\s+LIMIT|$)/i);
  if (orderMatch && orderMatch[1]) {
    var parts = orderMatch[1].trim().split(/\s+/);
    var col = parts[0];
    var dir = (parts[1] || 'ASC').toUpperCase() === 'DESC' ? -1 : 1;
    rows = rows.slice().sort(function (a, b) {
      var av = a[col];
      var bv = b[col];
      if (av == null) return 1;
      if (bv == null) return -1;
      return String(av) < String(bv) ? -dir : String(av) > String(bv) ? dir : 0;
    });
  }
  var limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    rows = rows.slice(0, parseInt(limitMatch[1], 10));
  }
  return rows;
}

function createInMemoryDatabaseImpl() {
  var db = {
    tables: new Map(),

    execSync: function (sql) {
      // Split multi-statement SQL on semicolons and execute each.
      var statements = sql.split(';').map(function (s) { return s.trim(); }).filter(Boolean);
      statements.forEach(function (stmt) {
        db.execOne(stmt);
      });
    },

    execOne: function (sql) {
      if (/CREATE TABLE/i.test(sql)) {
        var name = parseTableName(sql);
        if (!name) return;
        var cols = (sql.match(/\(([\s\S]*)\)/) || [])[1] || '';
        var columnNames = cols
          .split(',')
          .map(function (c) { return c.trim().split(/\s+/)[0]; })
          .filter(function (c) {
            if (!c) return false;
            var uc = c.toUpperCase();
            return !uc.startsWith('FOREIGN') && !uc.startsWith('PRIMARY') && !uc.startsWith('UNIQUE');
          });
        db.tables.set(name, { columns: columnNames, rows: [] });
        return;
      }
      if (/CREATE INDEX/i.test(sql)) return;
      if (/DROP TABLE/i.test(sql)) {
        var name2 = parseTableName(sql.replace(/DROP TABLE/i, 'CREATE TABLE'));
        db.tables.delete(name2);
        return;
      }
      if (/ALTER TABLE/i.test(sql)) {
        var name3 = parseTableName(sql.replace(/ALTER TABLE/i, 'CREATE TABLE'));
        var renameMatch = sql.match(/RENAME\s+TO\s+([^\s]+)/i);
        if (name3 && renameMatch) {
          var src = db.tables.get(name3);
          if (src) {
            db.tables.set(renameMatch[1], src);
            db.tables.delete(name3);
          }
          return;
        }
        var addCol = sql.match(/ADD COLUMN\s+([^\s]+)/i);
        if (name3 && addCol && db.tables.has(name3)) {
          db.tables.get(name3).columns.push(addCol[1]);
        }
        return;
      }
      if (/INSERT INTO/i.test(sql)) {
        var fromMatch = sql.match(/SELECT\s+([\s\S]*?)\s+FROM\s+([^\s]+)/i);
        if (fromMatch) {
          var dest = parseInsertTable(sql);
          var srcTable = db.tables.get(fromMatch[2]);
          var destTable = db.tables.get(dest);
          if (srcTable && destTable) {
            srcTable.rows.forEach(function (row) {
              var newRow = {};
              destTable.columns.forEach(function (col) {
                newRow[col] = row[col] !== undefined ? row[col] : null;
              });
              destTable.rows.push(newRow);
            });
          }
          return;
        }
      }
    },

    runSync: function (sql) {
      var params = Array.prototype.slice.call(arguments, 1);
      var bound = bindParams(sql, params.slice());
      if (/INSERT INTO/i.test(bound)) {
        var name = parseInsertTable(bound);
        var table = db.tables.get(name);
        if (!table) return;
        var valMatch = bound.match(/VALUES\s*\(([\s\S]*)\)/i);
        if (!valMatch) return;
        var values = valMatch[1].split(',').map(function (v) { return v.trim().replace(/^'(.*)'$/, '$1'); });
        var row = {};
        table.columns.forEach(function (col, i) {
          row[col] = values[i] !== undefined ? coerce(values[i]) : null;
        });
        table.rows.push(row);
        return;
      }
      if (/UPDATE/i.test(bound)) {
        var name2 = parseUpdateTable(bound);
        var table2 = db.tables.get(name2);
        if (!table2) return;
        var setMatch = bound.match(/SET\s+([\s\S]*?)\s+WHERE/i);
        var whereMatch = bound.match(/WHERE\s+([\s\S]*)$/i);
        if (!setMatch) return;
        var sets = {};
        setMatch[1].split(',').forEach(function (part) {
          var parts = part.trim().split('=');
          var k = parts[0].trim();
          var v = parts.slice(1).join('=').trim().replace(/^'(.*)'$/, '$1');
          sets[k] = coerce(v);
        });
        table2.rows.forEach(function (row) {
          if (matchesWhere(row, whereMatch ? whereMatch[1] : '')) {
            Object.assign(row, sets);
          }
        });
        return;
      }
      if (/DELETE FROM/i.test(bound)) {
        var name3 = parseDeleteTable(bound);
        var table3 = db.tables.get(name3);
        if (!table3) return;
        var whereMatch2 = bound.match(/WHERE\s+([\s\S]*)$/i);
        table3.rows = table3.rows.filter(function (row) { return !matchesWhere(row, whereMatch2 ? whereMatch2[1] : ''); });
      }
    },

    getAllSync: function (sql) {
      var params = Array.prototype.slice.call(arguments, 1);
      var bound = bindParams(sql, params.slice());
      return queryRows(bound, db);
    },

    getFirstSync: function (sql) {
      var params = Array.prototype.slice.call(arguments, 1);
      var rows = db.getAllSync.apply(db, [sql].concat(params));
      return rows[0] || null;
    },

    closeSync: function () {},
  };

  return db;
}

export function openDatabaseSync() {
  // Always return a fresh in-memory database. The app's getDatabase()
  // singleton (src/lib/db.ts) owns its own cache; tests reset it via closeDatabase().
  return createInMemoryDatabaseImpl();
}

export function closeDatabase() {
  // no-op for tests
}

export { createInMemoryDatabaseImpl as createInMemoryDatabase };