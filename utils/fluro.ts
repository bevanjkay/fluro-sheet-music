import { useStorage } from '@vueuse/core'

const user = useStorage('_fluro_user', { token: null }).value
const base = 'https://api.fluro.io'
let url

export const useFluroData = (contentType: string, id?: string | Array<string>, query?: object) => {
  if (!id) {
    url = `${base}/content/${contentType}`
  }
  else if (Array.isArray(id)) {
    url = `${base}/content/multiple?ids=${id.join('&ids=')}`
  }
  else if (typeof id == 'string') {
    url = `${base}/content/${contentType}/${id}`
  }
  else {
    throw new Error('Invalid ID type')
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  }

  return useLazyFetch(url as string, { headers, query })
}

export const useAsyncFluroData = async (contentType: string, id?: string | Array<string> | null, query?: object) => {
  if (!id) {
    url = `${base}/content/${contentType}`
  }
  else if (Array.isArray(id)) {
    url = `${base}/content/multiple?ids=${id.join('&ids=')}`
  }
  else if (typeof id == 'string') {
    url = `${base}/content/${contentType}/${id}`
  }
  else {
    throw new Error('Invalid ID type')
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  }
  const data = await useFetch(url, { headers, query })
  return data
}
