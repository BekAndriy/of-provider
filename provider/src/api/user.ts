import axios from 'axios'
import { API_URLS } from '../constants/urls'
import { TokenManager } from '../utils/token-manager'

export interface Profile {
  id: string
}

const getToken = () => `Bearer ${TokenManager.instance.token}`

export const getProfile = () => {
  return axios.get<Profile>(`${API_URLS.user}/profile`, {
    headers: {
      Authorization: getToken()
    }
  })
    .then((res) => res.data)
}
