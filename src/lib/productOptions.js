export function splitOptionValues(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean)
  return String(value || '')
    .split(/[·,;|\n]+/)
    .map(item => item.trim())
    .filter(Boolean)
}

export function getProductOption(product = {}) {
  const configured = product.option_enabled === true || product.option_enabled === 'true'
  const name = String(product.option_name || '').trim()
  const values = splitOptionValues(product.option_values)

  return {
    configured,
    enabled: configured && name.length > 0 && values.length > 0,
    name,
    values
  }
}

export function formatItemOption(item = {}) {
  const name = String(item.option_name || '').trim()
  const value = String(item.option_value || '').trim()
  return value ? `${name || 'Option'} : ${value}` : ''
}
