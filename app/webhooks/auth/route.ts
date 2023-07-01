export async function GET(request: Request) {
  const body = await request.json();
  console.log("GET /webhooks/auth", body);
  return new Response("OK");
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log("POST /webhooks/auth", body);
  return new Response("OK");
}
