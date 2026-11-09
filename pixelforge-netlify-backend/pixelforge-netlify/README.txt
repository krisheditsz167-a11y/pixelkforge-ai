PIXELFORGE AI — NETLIFY BACKEND STARTER

WHAT'S INCLUDED
- index.html: frontend wired to call the backend
- netlify/functions/generate-game.mjs: server-side function that calls Gemini
- The Gemini API key is read from process.env.GEMINI_API_KEY and is never sent to the browser.

SETUP
1. Have a parent/guardian help create and manage the AI provider account/API key and review any usage charges or limits.
2. In Netlify, create a new site by importing this project folder from a Git repository, OR deploy the whole folder using Netlify CLI. Do NOT upload only index.html: the netlify/functions folder must be included.
3. In the Netlify site dashboard, open Site configuration / Project configuration > Environment variables.
4. Add a variable named GEMINI_API_KEY and paste the key as its value. Do not put the key in index.html, Git, or a message.
5. Redeploy the site after adding the variable.
6. Open the deployed site, enter a game description, choose HTML + CSS + JavaScript, and click Generate with AI.

IMPORTANT
- This starter uses the Gemini generateContent REST endpoint and model gemini-3.8-flash. Check the provider's current model availability, account requirements, quotas and pricing before use.
- HTML output is rendered in an iframe with sandbox="allow-scripts". Treat generated code as untrusted; don't remove the sandbox.
- The Python/C++/Lua choices return code but do not run those languages in the browser.
- Add rate limiting, abuse protection, and spending limits before making the site public.
- Never share your API key. If it is exposed, revoke it and create a new one.

DOCS
Netlify Functions: https://docs.netlify.com/build/functions/overview/
Netlify environment variables: https://docs.netlify.com/build/environment-variables/
Gemini API: https://ai.google.dev/gemini-api/docs
