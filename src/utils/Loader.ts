import { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { IResource, resources } from '@/config/resources';

export interface IModels {
  [key: string]: any;
}

export default class Loader {
  private gltfLoader: GLTFLoader;

  models: IModels;

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.models = {};
  }

  load(path: string) {
    return new Promise<Object3D>((resolve) => {
      this.gltfLoader.load(path, (res) => {
        resolve(res.scene);
      });
    });
  }

  loadResources() {
    return Promise.all(resources.map((resource: IResource) => this.load(resource.path))).then(
      (res) => {
        res.forEach((obj, index) => {
          this.models[resources[index].name] = obj;
        });
        return this.models;
      },
    );
  }
}
