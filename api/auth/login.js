// api/auth/login.js

export default async function handler(req, res) {
  // 1) Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2) Parse & validate input
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ error: "Request must include email and password strings." });
  }

  // 3) Stubbed credential check
  //    Replace this block with a real DB lookup once you're ready.
  const VALID_EMAIL = "user@example.com";
  const VALID_PW    = "password";
  if (email === VALID_EMAIL && password === VALID_PW) {
    // 4) Return a fake JWT (or whatever your front-end expects)
    return res.status(200).json({
      token: "fake-jwt-token",
      user: { email: VALID_EMAIL, name: "Demo User" },
    });
  }

  // 5) On failure
  return res.status(401).json({ error: "Invalid credentials." });
}
