import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  async setWalkthrough(key: string, state: any) {
    await Storage.set({
      key,
      value: JSON.stringify(state)
    });
  }

  async getWalkthrough(state: any) {
    return await Storage.get({ key: state });
  }

  async setObject(key: string, obj: {}) {
    await Storage.set({
      key,
      value: JSON.stringify(obj)
    });
  }

  async getObject(key: string) {
    const ret = await Storage.get({ key });
    return JSON.parse(ret.value);
  }

  async setItem(key: string, item: string) {
    await Storage.set({
      key,
      value: item
    });
  }

  async getItem(item: string) {
    return await Storage.get({ key: item });
  }

  async removeItem(item: string) {
    await Storage.remove({ key: item });
  }

  async keys() {
    return await Storage.keys();
  }

  async clear() {
    await Storage.clear();
  }

}
