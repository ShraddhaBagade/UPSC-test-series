const baseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const publicKey = process.env.SUPABASE_ANON_KEY || "";

export async function requireUser(req, res, next) {
  const token = /^Bearer (\S+)$/.exec(req.get("Authorization") || "")?.[1];

  if (!baseUrl || !publicKey) {
    return res.status(503).json({
      error: "Configure Supabase Auth on the server.",
    });
  }

  if (!token) {
    return res.status(401).json({
      error: "Log in to access your study notes.",
    });
  }

  try {
    const response = await fetch(`${baseUrl}/auth/v1/user`, {
      headers: {
        apikey: publicKey,
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(401).json({
        error: "Your login has expired. Please log in again.",
      });
    }

    const user = await response.json();

    if (!user.id) {
      return res.status(401).json({ error: "Invalid login." });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
