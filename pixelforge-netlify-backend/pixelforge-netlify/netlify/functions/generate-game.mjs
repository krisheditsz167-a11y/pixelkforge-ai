// Netlify Function: keeps GEMINI_API_KEY on the server.
export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Use POST for game generation." }, { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server setup is incomplete: GEMINI_API_KEY is missing in Netlify environment variables." }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const language = typeof body.language === "string" ? body.language : "html";
  const allowed = new Set(["html", "python", "cpp", "lua"]);

  if (!prompt || prompt.length > 5000) {
    return Response.json({ error: "Enter a game description up to 5,000 characters." }, { status: 400 });
  }
  if (!allowed.has(language)) {
    return Response.json({ error: "That programming language is not supported." }, { status: 400 });
  }

  const languageInstructions = {
    html: "Return one complete standalone HTML document with embedded CSS and JavaScript. It must be a playable 2D game, use Canvas where suitable, include controls and a restart button, and work when placed in an iframe srcdoc. Do not load external scripts, libraries, images, fonts, or network resources. Use simple original shapes or CSS-drawn art if assets are needed.",
    python: "Return complete Python 3 source using Pygame. Include setup/run instructions as comments.",
    cpp: "Return complete C++ source using SFML 2.x. Include setup/run instructions as comments.",
    lua: "Return complete Lua source using LÖVE. Include setup/run instructions as comments."
  };

  const instruction = `You are PixelForge AI, a careful 2D game developer. Turn the user's idea into a complete small game prototype. Make sensible design decisions when details are missing. Keep the game age-appropriate. Do not include external network calls, analytics, tracking, data collection, or hidden code. Output must be valid JSON with exactly these string fields: title, code. The code field must contain source code only, not Markdown fences. Target language requirements: ${languageInstructions[language]}`;

  try {
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: instruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              code: { type: "STRING" }
            },
            required: ["title", "code"]
          },
          maxOutputTokens: 12000,
          temperature: 0.7
        }
      })
    });

    const result = await upstream.json();
    if (!upstream.ok) {
      return Response.json({ error: result.error?.message || "The AI provider returned an error." }, { status: 502 });
    }

    const text = result.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("");
    if (!text) {
      return Response.json({ error: "The AI returned an empty response. Try a shorter description." }, { status: 502 });
    }

    let output;
    try { output = JSON.parse(text); }
    catch { return Response.json({ error: "The AI response was not valid game code. Please try again." }, { status: 502 }); }

    if (typeof output.code !== "string" || !output.code.trim()) {
      return Response.json({ error: "The AI did not return source code. Please try again." }, { status: 502 });
    }

    return Response.json({
      title: String(output.title || "Your generated game").slice(0, 100),
      code: output.code
    });
  } catch {
    return Response.json({ error: "Could not reach the AI service. Please try again later." }, { status: 502 });
  }
};
