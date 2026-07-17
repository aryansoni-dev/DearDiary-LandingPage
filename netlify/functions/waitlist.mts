const FORMSPARK_ACTION_URL = "https://submit-form.com/lJkJs3bKv";

const jsonResponse = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });

export default async function waitlist(request: Request) {
  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      405,
      { Allow: "POST" },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Invalid form submission" }, 400);
  }

  const { name, email } = payload as Record<string, unknown>;
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!normalizedName) {
    return jsonResponse({ error: "Name is required" }, 400);
  }

  if (!normalizedEmail) {
    return jsonResponse({ error: "Email is required" }, 400);
  }

  if (!emailRegex.test(normalizedEmail)) {
    return jsonResponse({ error: "Please enter a valid email address" }, 400);
  }

  try {
    const formsparkResponse = await fetch(FORMSPARK_ACTION_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: normalizedName,
        email: normalizedEmail,
      }),
    });

    let formsparkData: Record<string, unknown> = {};

    try {
      const data: unknown = await formsparkResponse.json();
      if (data && typeof data === "object") {
        formsparkData = data as Record<string, unknown>;
      }
    } catch {
      // A successful Formspark response is not guaranteed to contain JSON.
    }

    if (!formsparkResponse.ok) {
      const providerError = formsparkData.message ?? formsparkData.error;
      return jsonResponse(
        {
          error: typeof providerError === "string"
            ? providerError
            : "Waitlist submission failed",
        },
        formsparkResponse.status,
      );
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Formspark waitlist submission failed", error);
    return jsonResponse(
      { error: "Unable to submit the form right now. Please try again later." },
      502,
    );
  }
}

export const config = {
  path: "/api/waitlist",
};
