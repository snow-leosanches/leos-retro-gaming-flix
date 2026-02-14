export function navigate(path: string, id?: string): void {
  const segment = id ? `${path}/${id}` : path
  window.location.hash = segment
}

export function initRouter(onChange: () => void): void {
  window.addEventListener('hashchange', onChange)
}
