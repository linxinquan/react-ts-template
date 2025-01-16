import { Line, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';
import RendererCore from '@/utils/RendererCore';
import { StripeMaterial } from './materials';

export default class TextureEditor {
  renderer: RendererCore;

  object3d!: Mesh;

  line?: Line;

  mesh?: Mesh;

  constructor(renderer: RendererCore) {
    this.renderer = renderer;
    this.renderer.camera.position.set(0, 0, 10);
    this.createBox();
  }

  createBox() {
    // const geometry = new BoxGeometry(10, 10, 10);
    const geometry = new SphereGeometry(10, 32, 32);
    const material = new StripeMaterial();
    this.object3d = new Mesh(geometry, material);
    this.renderer.add(this.object3d);
    this.renderer.render();
  }

  updateMaterial() {
    this.object3d.material = new MeshBasicMaterial();
    this.object3d.material.needsUpdate = true;
    this.renderer.render();
  }

  dispose() {
    this.renderer.cleanup(this.object3d);
  }
}
