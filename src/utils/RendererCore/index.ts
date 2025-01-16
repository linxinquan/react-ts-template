import { AmbientLight, Color, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import EventDispatcher from '../EventDispatcher';

function dispose(object: any) {
  // 确保 CSS2DObject 和 CSS3DObject 对应的 DOM 元素被移除
  object?.dispatchEvent({ type: 'removed' });
  if (object.geometry) {
    object.geometry.dispose();
    // eslint-disable-next-line no-param-reassign
    delete object.geometry;
  }
}
export default class RendererCore extends EventDispatcher {
  domElement: HTMLDivElement;

  renderer: WebGLRenderer;

  scene: Scene;

  camera: PerspectiveCamera;

  private animationId = -1;

  private destroyed = false;

  constructor(domElement: HTMLDivElement) {
    super();
    this.domElement = domElement;
    const width = domElement.clientWidth;
    const height = domElement.clientHeight;
    this.renderer = new WebGLRenderer();
    this.scene = new Scene();
    this.scene.background = new Color(0x3f3f3f);
    this.renderer.setSize(width, height);
    this.camera = new PerspectiveCamera(50, width / height, 0.1, 2000);
    this.camera.position.set(0, 0, 50);
    this.domElement.append(this.renderer.domElement);

    this.initCameraControls();
    this.addLight();
    this.resize();
  }

  dispose() {
    this.renderer.dispose();
    window.removeEventListener('resize', this.handleWindowResize);
  }

  initCameraControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.addEventListener('change', () => {
      this.render();
    });
  }

  addLight() {
    // const light = new DirectionalLight(0xffffff, 1.5);
    const ambientLight = new AmbientLight(0xffffff, Math.PI);
    // light.position.set(0, 0, 20);
    ambientLight.position.set(0, 20, 0);
    this.add(ambientLight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  add(...objs: Object3D[]) {
    this.scene.add(...objs);
  }

  cleanup(...objects: (Object3D | undefined | null)[]) {
    const nonNullObjects = objects.filter(Boolean) as Object3D[];
    nonNullObjects.forEach((object) => {
      object.removeFromParent();
      requestIdleCallback(() => {
        object.traverse((child) => dispose(child));
      });
    });
    if (nonNullObjects.length) {
      this.render();
    }
  }

  resize() {
    window.addEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    this.renderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
    this.camera.aspect = this.domElement.clientWidth / this.domElement.clientHeight;
    this.camera.updateProjectionMatrix();
  };

  renderSync() {
    if (this.destroyed) {
      return;
    }
    this.render();
    this.dispatchEvent({
      type: 'afterRender',
    });
  }

  animate(callback?: () => void) {
    this.renderSync();
    this.animationId = requestAnimationFrame(this.animate.bind(this, callback));
    if (callback && !this.destroyed) {
      callback();
    }
  }

  cancelAnimate() {
    if (this.animationId !== -1) {
      cancelAnimationFrame(this.animationId);
      this.animationId = -1;
    }
    this.renderSync();
  }
}
