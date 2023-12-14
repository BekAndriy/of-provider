import axios from 'axios'
import { API_URLS } from '../constants/urls'
import { TokenManager } from '../utils/token-manager'

export interface LoginParams {
  email: string
  password: string
}

export interface File {
  name: string
  updatedAt: string
}

interface GetMethod {
  <T extends object>(fileName: string): Promise<T>
  (): Promise<File[]>
}

export interface StoreFolder {
  folderPath: string
  get: GetMethod
  save: <T extends object>(fileName: string, data: T) => unknown
  delete: <T extends object>(fileName: string, data: T) => unknown
}

const getToken = () => `Bearer ${TokenManager.instance.token}`

class StoreFolderImpl implements StoreFolder {
  constructor(public readonly folderPath: string) {

  }

  save(fileName: string, data: object) {
    return axios.post(this.joinPath(fileName), data, {
      headers: {
        Authorization: getToken()
      }
    })
      .then((res) => res.data)
  }

  delete(fileName: string) {
    const fileWithExt = this.getFileNameWithExt(fileName)
    return axios.delete(this.joinPath(fileWithExt), {
      headers: {
        Authorization: getToken()
      }
    })
      .then((res) => res.data)
  }

  get: GetMethod = (fileName?: string) => {
    const fileWithExt = this.getFileNameWithExt(fileName)
    return axios.get(this.joinPath(fileWithExt), {
      headers: {
        Authorization: getToken()
      }
    })
      .then((res) => res.data)
  }

  private joinPath(...parts: string[]) {
    return [API_URLS.store, this.folderPath, ...parts].filter(Boolean).join('/')
  }

  private getFileNameWithExt(fileName: string = '') {
    return fileName && `${fileName}.json`
  }
}

export type StoreFolderType = StoreFolder

export const workspaces = new StoreFolderImpl('workspaces')
export const pages = new StoreFolderImpl('pages')
