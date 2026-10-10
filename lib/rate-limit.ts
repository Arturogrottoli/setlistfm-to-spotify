// Rate limiting de ventana fija.
//
// En producción (Vercel, serverless) usa Upstash Redis vía su API REST, configurado con
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (o KV_REST_API_URL / KV_REST_API_TOKEN,
// que es lo que crea la integración de Upstash del Marketplace de Vercel).
//
// Si no hay Redis configurado (o falla), cae a un contador en memoria. ADVERTENCIA: en serverless
// ese contador es por instancia y se pierde en cada cold start, así que NO es una protección
// confiable en producción; sólo sirve para desarrollo local.

export interface RateLimitRule {
  key: string
  limit: number
  windowSeconds: number
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

const memoryStore = new Map<string, { count: number; resetAt: number }>()
let warnedAboutMemory = false

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ""), token } : null
}

async function incrementRedis(config: { url: string; token: string }, rule: RateLimitRule) {
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    body: JSON.stringify([
      ["INCR", rule.key],
      ["EXPIRE", rule.key, String(rule.windowSeconds), "NX"],
      ["TTL", rule.key],
    ]),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Upstash respondió ${response.status}`)
  }

  const [incr, , ttl] = (await response.json()) as { result?: number; error?: string }[]
  if (incr?.error || typeof incr?.result !== "number") {
    throw new Error("Respuesta inválida de Upstash")
  }

  return { count: incr.result, ttl: typeof ttl?.result === "number" && ttl.result > 0 ? ttl.result : rule.windowSeconds }
}

function incrementMemory(rule: RateLimitRule) {
  if (!warnedAboutMemory) {
    console.warn("Rate limit en memoria: no es efectivo en serverless. Configurá Upstash Redis.")
    warnedAboutMemory = true
  }

  const now = Date.now()
  const entry = memoryStore.get(rule.key)
  if (!entry || entry.resetAt <= now) {
    memoryStore.set(rule.key, { count: 1, resetAt: now + rule.windowSeconds * 1000 })
    return { count: 1, ttl: rule.windowSeconds }
  }

  entry.count++
  return { count: entry.count, ttl: Math.ceil((entry.resetAt - now) / 1000) }
}

async function increment(rule: RateLimitRule) {
  const redis = getRedisConfig()
  if (redis) {
    try {
      return await incrementRedis(redis, rule)
    } catch (error) {
      console.error("Error de rate limit en Redis, usando memoria:", error instanceof Error ? error.message : error)
    }
  }
  return incrementMemory(rule)
}

// Evalúa las reglas en orden y se detiene en la primera que se excede,
// para que una IP bloqueada no consuma el cupo global.
export async function checkRateLimit(rules: RateLimitRule[]): Promise<RateLimitResult> {
  for (const rule of rules) {
    const { count, ttl } = await increment(rule)
    if (count > rule.limit) {
      return { allowed: false, retryAfterSeconds: ttl }
    }
  }
  return { allowed: true, retryAfterSeconds: 0 }
}

export function getClientIp(request: Request) {
  // En Vercel, x-forwarded-for / x-real-ip los fija la plataforma.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip") || "unknown"
}
