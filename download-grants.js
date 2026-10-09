import { createHash, randomBytes } from "node:crypto";

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

export function createDownloadGrants(ttlMs = 10 * 60 * 1000) {
  const grants = new Map();
  const digest = (token) => createHash("sha256").update(token).digest("hex");

  return {
    issue(order, now = Date.now()) {
      if (
        order?.status !== "captured" ||
        !Array.isArray(order.selection?.subjectIds)
      ) {
        throw new Error("Only captured orders can receive a download grant.");
      }

      for (const [hash, grant] of grants) {
        if (grant.expiresAt <= now) grants.delete(hash);
      }

      const token = randomBytes(32).toString("base64url");
      const expiresAt = now + ttlMs;

      grants.set(digest(token), { order, expiresAt });

      return { token, expiresAt };
    },

    authorize(token, subjectId, now = Date.now()) {
      if (typeof token !== "string" || !tokenPattern.test(token)) {
        return false;
      }

      const grant = grants.get(digest(token));
      if (!grant) return false;

      if (grant.expiresAt <= now) {
        grants.delete(digest(token));
        return false;
      }

      return (
        grant.order.status === "captured" &&
        grant.order.selection.subjectIds.includes(subjectId)
      );
    },
  };
}
