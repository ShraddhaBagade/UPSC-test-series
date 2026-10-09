import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export function createPurchaseStore(filePath) {
  let queue = Promise.resolve();

  async function read() {
    try {
      const data = JSON.parse(await readFile(filePath, "utf8"));

      if (!Array.isArray(data)) {
        throw new Error("Invalid purchase ledger");
      }

      return data;
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  function add(purchase) {
    const task = queue.then(async () => {
      const entries = await read();

      if (entries.some((entry) => entry.orderId === purchase.orderId)) {
        return;
      }

      await mkdir(dirname(filePath), { recursive: true });

      const tempPath = `${filePath}.${randomUUID()}.tmp`;

      await writeFile(
        tempPath,
        JSON.stringify([...entries, purchase], null, 2),
        { mode: 0o600 },
      );

      await rename(tempPath, filePath);
    });

    queue = task.catch(() => {});
    return task;
  }

  async function list(userId) {
    await queue;
    if (!userId) return [];

    return (await read())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
      .map(
        ({ userId: _userId, deviceHash: _deviceHash, ...publicPurchase }) =>
          publicPurchase,
      );
  }

  async function allowed(userId, orderId, subjectId) {
    if (!userId) return false;

    const purchases = await list(userId);

    return purchases.some(
      (purchase) =>
        purchase.orderId === orderId && purchase.subjectIds.includes(subjectId),
    );
  }

  return { add, list, allowed };
}
