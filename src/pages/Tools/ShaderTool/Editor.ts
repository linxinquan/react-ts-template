import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
} from 'three';
import RendererCore from '@/utils/RendererCore';

export const DefaultVertex = `void main() {gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}`;
export const DefaultFragment = `uniform vec3 color; void main() {gl_FragColor = vec4(color, 1.0 );}`;
export default class Editor {
  private renderer: RendererCore;

  obj: Mesh;

  material: ShaderMaterial;

  constructor(renderer: RendererCore) {
    this.renderer = renderer;
    const geometry = new BoxGeometry(10, 15, 10);
    this.material = new ShaderMaterial({
      uniforms: {
        color: { value: new Color(0xbb5858) },
      },
      vertexShader: DefaultVertex,
      fragmentShader: DefaultFragment,
    });
    this.obj = new Mesh(geometry, this.material);
    this.renderer.add(this.obj);
    this.renderer.render();
  }

  updateVertex(value: string) {
    this.material.vertexShader = value;
    this.material.needsUpdate = true;
    this.renderer.render();
  }

  updateFragment(value: string) {
    this.material.fragmentShader = value;
    this.material.needsUpdate = true;
    this.renderer.render();
  }

  setUniform(key: string, value: any) {
    this.material.uniforms[key] = { value };
    this.material.needsUpdate = true;
    this.renderer.render();
  }

  updateGeom(key: string) {
    switch (key) {
      case 'box':
        this.obj.geometry = new BoxGeometry(10, 15, 10);
        break;
      case 'sphere':
        this.obj.geometry = new SphereGeometry(10, 15, 10);
        break;
      case 'cylinder':
        this.obj.geometry = new CylinderGeometry(10, 10, 15, 15);
        break;
      case 'plane':
        this.obj.geometry = new PlaneGeometry(20, 20);
        break;
      default:
        break;
    }
    this.renderer.render();
  }
}
