import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { randomUUID } from "crypto";

function getTableName(table: any): string {
  if (!table) return "unknown";
  if (typeof table === "string") return table;
  if (table._?.name) return table._.name;
  const symbols = Object.getOwnPropertySymbols(table);
  const nameSym = symbols.find((s) => s.description === "drizzle:Name");
  if (nameSym && table[nameSym]) return table[nameSym];
  return "unknown";
}

const memoryStore = new Map<string, any[]>();

function createMockDb() {
  function createQueryBuilder(initialState: {
    type?: "select" | "insert" | "update" | "delete";
    table?: any;
    values?: any[];
    selectFields?: any;
    whereClause?: any;
  } = {}) {
    const state = { ...initialState };

    const builder: any = {
      from(table: any) {
        state.table = table;
        return builder;
      },
      values(val: any) {
        const arr = Array.isArray(val) ? val : [val];
        state.values = arr.map((item) => ({
          id: item.id || randomUUID(),
          createdAt: item.createdAt || new Date(),
          updatedAt: item.updatedAt || new Date(),
          ...item,
        }));
        const tName = getTableName(state.table);
        const existing = memoryStore.get(tName) || [];
        for (const item of state.values) {
          const idx = existing.findIndex(
            (e) => (item.id && e.id === item.id) || (item.email && e.email === item.email)
          );
          if (idx >= 0) {
            existing[idx] = { ...existing[idx], ...item };
          } else {
            existing.push(item);
          }
        }
        memoryStore.set(tName, existing);
        return builder;
      },
      set(val: any) {
        state.values = [val];
        const tName = getTableName(state.table);
        const existing = memoryStore.get(tName) || [];
        for (let i = 0; i < existing.length; i++) {
          existing[i] = { ...existing[i], ...val, updatedAt: new Date() };
        }
        return builder;
      },
      onConflictDoUpdate(opts: any) {
        if (opts?.set && state.values) {
          const tName = getTableName(state.table);
          const existing = memoryStore.get(tName) || [];
          for (const val of state.values) {
            const idx = existing.findIndex(
              (e) => (val.id && e.id === val.id) || (val.email && e.email === val.email)
            );
            if (idx >= 0) {
              existing[idx] = { ...existing[idx], ...opts.set };
            }
          }
        }
        return builder;
      },
      onConflictDoNothing() {
        return builder;
      },
      returning() {
        return builder;
      },
      where(clause: any) {
        state.whereClause = clause;
        return builder;
      },
      orderBy(..._args: any[]) {
        return builder;
      },
      limit(_num: number) {
        return builder;
      },
      offset(_num: number) {
        return builder;
      },
      innerJoin(_t: any, _on: any) {
        return builder;
      },
      leftJoin(_t: any, _on: any) {
        return builder;
      },
      rightJoin(_t: any, _on: any) {
        return builder;
      },
      groupBy(..._args: any[]) {
        return builder;
      },
      catch(_fn: any) {
        return builder;
      },
      then(resolve: (val: any) => any, reject?: (err: any) => any) {
        try {
          if (state.type === "insert") {
            return resolve(state.values || []);
          }
          if (state.type === "update") {
            const tName = getTableName(state.table);
            return resolve(memoryStore.get(tName) || state.values || []);
          }
          if (state.type === "delete") {
            return resolve([]);
          }
          const tName = getTableName(state.table);
          const rows = memoryStore.get(tName) || [];
          if (
            state.selectFields &&
            typeof state.selectFields === "object" &&
            !Array.isArray(state.selectFields) &&
            !(state.selectFields as any)._ &&
            !(state.selectFields as any)[Symbol.for("drizzle:Name")]
          ) {
            const plansList = memoryStore.get("plans") || [];
            return resolve(
              rows.map((row) => {
                const plan =
                  plansList.find((p) => p.id === row.planId) ||
                  plansList[0] || { id: row.planId || "plan-pro", name: "Pro Plan" };
                return {
                  ...row,
                  subscription: row,
                  plan,
                };
              })
            );
          }
          return resolve([...rows]);
        } catch (err) {
          if (reject) return reject(err);
          return resolve([]);
        }
      },
    };

    return builder;
  }

  const mockDb: any = {
    select(fields?: any) {
      return createQueryBuilder({ type: "select", selectFields: fields });
    },
    insert(table: any) {
      return createQueryBuilder({ type: "insert", table });
    },
    update(table: any) {
      return createQueryBuilder({ type: "update", table });
    },
    delete(table: any) {
      return createQueryBuilder({ type: "delete", table });
    },
    execute(_query: any) {
      return Promise.resolve({ rows: [] });
    },
    query: new Proxy(
      {},
      {
        get(_, tableProp) {
          const tName = String(tableProp);
          return {
            findMany: async () => memoryStore.get(tName) || [],
            findFirst: async () => (memoryStore.get(tName) || [])[0] || null,
            findUnique: async () => (memoryStore.get(tName) || [])[0] || null,
            create: async (d: any) => d?.data ?? {},
            update: async (d: any) => d?.data ?? {},
            delete: async () => ({}),
          };
        },
      }
    ),
  };

  return mockDb;
}

const databaseUrl = process.env.DATABASE_URL;

let dbInstance: any;
let poolInstance: any;

if (databaseUrl && !databaseUrl.includes("localhost") && !databaseUrl.includes("127.0.0.1")) {
  try {
    const globalForDb = globalThis as typeof globalThis & {
      __arenaNextJsPostgresqlPool?: Pool;
    };
    poolInstance =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      });
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = poolInstance;
    }
    dbInstance = drizzle(poolInstance);
  } catch (err) {
    console.warn("[AI Studio] Database connection failed, using in-memory mock:", err);
    dbInstance = createMockDb();
    poolInstance = {
      query: async () => ({ rows: [] }),
      connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
    };
  }
} else {
  dbInstance = createMockDb();
  poolInstance = {
    query: async () => ({ rows: [] }),
    connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
  };
}

export const pool = poolInstance;
export const db = dbInstance as unknown as ReturnType<typeof drizzle>;

