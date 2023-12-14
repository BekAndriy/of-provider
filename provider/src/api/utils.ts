import qs from 'query-string'

export const stringifyQuery = (q = {}) =>
  (Object.keys(q).length > 0)
    ? `?${qs.stringify(q, { skipEmptyString: true, skipNull: true })}`
    : ''
