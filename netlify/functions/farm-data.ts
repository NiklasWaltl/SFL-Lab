import type { Handler } from "@netlify/functions";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60",
  "Content-Type": "application/json",
};

function parseFarmId(value: string | undefined): number | null {
  if (!value) return null;

  const farmId = Number(value);
  return Number.isFinite(farmId) && farmId > 0 ? farmId : null;
}

export const handler: Handler = async (event) => {
  const farmId = parseFarmId(event.queryStringParameters?.id);
  const apiKey = event.headers["x-api-key"];

  if (!farmId) {
    return {
      statusCode: 400,
      headers: CACHE_HEADERS,
      body: JSON.stringify({ error: "Missing or invalid farm id" }),
    };
  }

  if (!apiKey) {
    return {
      statusCode: 400,
      headers: CACHE_HEADERS,
      body: JSON.stringify({ error: "Missing x-api-key header" }),
    };
  }

  try {
    const res = await fetch(
      `https://api.sunflower-land.com/community/farms/${farmId}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      },
    );
    const body = await res.text();

    return {
      statusCode: res.status,
      headers: CACHE_HEADERS,
      body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: CACHE_HEADERS,
      body: JSON.stringify({ error: "Failed to fetch public farm data" }),
    };
  }
};
