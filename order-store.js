import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export function createOrderStore(filePath) {
  let queue = Promise.resolve();

  async function read() {
    try {
      const data = JSON.parse(await readFile(filePath, "utf8"));

      if (!Array.isArray(data)) {
        throw new Error("Invalid order store");
      }

      return data;
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  async function write(entries) {
    await mkdir(dirname(filePath), { recursive: true });

    const tempPath = `${filePath}.${randomUUID()}.tmp`;

    await writeFile(tempPath, JSON.stringify(entries, null, 2), {
      mode: 0o600,
    });

    await rename(tempPath, filePath);
  }

  function add(order) {
    const task = queue.then(async () => {
      const entries = await read();
      const index = entries.findIndex((entry) => entry.id === order.id);

      if (index >= 0) {
        entries[index] = order;
      } else {
        entries.push(order);
      }

      await write(entries);
    });

    queue = task.catch(() => {});
    return task;
  }

  function update(orderId, changes) {
    const task = queue.then(async () => {
      const entries = await read();
      const index = entries.findIndex((entry) => entry.id === orderId);

      if (index < 0) {
        throw new Error("Order not found in local order store");
      }

      entries[index] = { ...entries[index], ...changes };
      await write(entries);
    });

    queue = task.catch(() => {});
    return task;
  }

  async function get(orderId) {
    await queue;
    return (await read()).find((entry) => entry.id === orderId) || null;
  }

  return { add, get, update };
}
