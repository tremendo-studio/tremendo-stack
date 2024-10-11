export type Result<V, E = Error> = { error: E; ok: false } | { ok: true; value: V }
export type AsyncResult<V, E = Error> = Promise<Result<V, E>>
