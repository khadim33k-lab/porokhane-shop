export function withTimeout(promise, milliseconds = 9000) {
  let timeoutId
  const timeout = new Promise((_, reject) => { timeoutId = window.setTimeout(() => reject(new Error('Délai de connexion dépassé')), milliseconds) })
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => window.clearTimeout(timeoutId))
}
