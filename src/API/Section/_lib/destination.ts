const destination = (node) => {
  let value = node.target || ''
  if (node.heading != null) { value += '#' + node.heading }
  else if (node.block != null) { value += '#^' + node.block }
  return value
}

export default destination
