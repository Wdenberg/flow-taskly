import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = "https://task-api-9vu0.onrender.com/api/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

async function proxy({ request, params }: { request: Request; params: { _splat?: string } }) {
  const path = params._splat ?? "";
  const url = new URL(request.url);
  const target = `${UPSTREAM}/${path}${url.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");
  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);
  headers.set("accept", "application/json");

  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      ...(hasBody ? { body: await request.text() } : {}),
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
        ...corsHeaders,
      },
    });
  } catch {
    return new Response(JSON.stringify({ message: "Não foi possível contatar o servidor de tarefas." }), {
      status: 502,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }
}

export const Route = createFileRoute("/api/public/task-api/$")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: proxy,
      POST: proxy,
      PUT: proxy,
      PATCH: proxy,
      DELETE: proxy,
    },
  },
});
