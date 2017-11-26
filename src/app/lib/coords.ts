export function coordTransform(clientX: number, hRect: ClientRect) {
  return clientX-hRect.left
}
