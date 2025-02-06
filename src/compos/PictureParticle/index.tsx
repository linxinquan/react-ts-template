import * as TWEEN from '@tweenjs/tween.js';
import { BufferGeometry, Color, Points, ShaderMaterial } from 'three';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min';
import RendererCore from '@/utils/RendererCore';
import { PixelColor, createMutableGeometry, loadImage } from './utils';
import particleFragment from './shader/particle_fragment.glsl';
import particleVertex from './shader/particle_vertex.glsl';
import gradualVertex from './shader/gradual_vertex.glsl';
import gradualFragment from './shader/gradual_fragment.glsl';
import fullscreen from '@/utils/fullscreen';

interface IGuiParams {
  pointSize: number;
  speed: number;
  lifeCycle: number;
  updateProbability: number;
  color: number;
}
const { Tween } = TWEEN;

export default class ParticleCreator {
  private renderer: RendererCore;

  private point3d!: Points;

  private material!: ShaderMaterial;

  private gui: GUI;

  private guiParams: IGuiParams;

  private time: number;

  private progress: number;

  private tweenGroup: TWEEN.Group;

  private imgPixels: Record<string, PixelColor[]>;

  constructor(renderer: RendererCore) {
    this.renderer = renderer;
    this.renderer.scene.background = new Color('#e7fcf6');
    this.gui = new GUI();
    this.tweenGroup = new TWEEN.Group();
    this.guiParams = {
      pointSize: 6,
      speed: 0.1,
      lifeCycle: 20,
      updateProbability: 0,
      color: 0xadd8e6,
    };
    this.time = 0;
    this.progress = 0;
    this.addGUI();
    fullscreen(renderer);
    this.imgPixels = {};
    this.createPoint3d();
  }

  dispose() {
    this.renderer.cleanup(this.point3d);
    this.renderer.cancelAnimate();
    this.gui.destroy();
    this.gui = new GUI();
    this.addGUI();
  }

  createPoint3d() {
    const geometry = new BufferGeometry();
    this.point3d = new Points(geometry);
    const material = this.createGradualMaterial();
    this.point3d.material = material;
    this.point3d.material.needsUpdate = true;
    this.material = material;
    this.renderer.add(this.point3d);
    this.renderer.animate(this.update.bind(this));
  }

  async loadImgs(paths: string[]) {
    await Promise.all(
      paths.map(async (url) => {
        const img = await loadImage(url);
        this.imgPixels[url] = img;
      }),
    );
  }

  updateGeometry(url: string) {
    const img = this.imgPixels[url];
    if (!img) {
      return;
    }
    createMutableGeometry(this.point3d.geometry, img, 0.1);
    this.renderer.render();
    const tween = new Tween(this.material.uniforms.uProgress)
      .to({ value: 1 }, 2000)
      .delay(500)
      .onComplete(() => {
        if (this.material) {
          this.material.uniformsNeedUpdate = true;
          // this.point3d.geometry.attributes.
        }
      })
      .start();
    this.tweenGroup.add(tween);
  }

  async createPoints(url: string = '/fish.svg') {
    this.time = 0;
    await this.recovery();
    const img = await loadImage(url);
    // const size = img.width * img.height;
    createMutableGeometry(this.point3d.geometry, img, 0.1);
    const material = this.createGradualMaterial();
    this.point3d.material = material;
    this.point3d.material.needsUpdate = true;
    this.material = material;
    this.renderer.render();

    const tween = new Tween(this.material.uniforms.uProgress)
      .to({ value: 1 }, 2000)
      .delay(100)
      .onComplete(() => {
        this.material.uniformsNeedUpdate = true;
      })
      .start();
    this.tweenGroup.add(tween);
  }

  recovery() {
    return new Promise<void>((resolve, reject) => {
      if (this.material) {
        const tween = new Tween(this.material.uniforms.uProgress)
          .to({ value: 0 }, 300)
          .onComplete(() => {
            if (this.material) {
              this.material.uniformsNeedUpdate = true;
            }
            resolve();
          })
          .start();
        this.tweenGroup.add(tween);
      } else {
        reject();
      }
    });
  }

  addGUI() {
    this.gui.add(this.guiParams, 'pointSize', 0.1, 12).onChange((value) => {
      this.guiParams.pointSize = value;
      if (this.material) {
        this.material.uniforms.pointSize.value = value;
        this.material.needsUpdate = true;
        this.renderer.render();
      }
    });

    // this.gui.add(this.guiParams, 'speed', 0, 1).onChange((value) => {
    //   this.guiParams.speed = value;
    // });
    // this.gui.add(this.guiParams, 'lifeCycle', 0, 100).onChange((value) => {
    //   this.guiParams.lifeCycle = value;
    //   if (this.material) {
    //     this.material.uniforms.lifeCycle.value = value;
    //     this.renderer.render();
    //   }
    // });
    // this.gui.add(this.guiParams, 'updateProbability', 0, 4).onChange((value) => {
    //   this.guiParams.updateProbability = value;
    //   if (this.material) {
    //     this.material.uniforms.updateProbability.value = value;
    //     this.renderer.render();
    //   }
    // });
    this.gui.addColor(this.guiParams, 'color').onChange((value) => {
      this.guiParams.color = value;
      if (this.material) {
        this.material.uniforms.uColor.value = new Color(value);
        this.renderer.render();
      }
    });
  }

  createFallMaterial() {
    const material = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointSize: { value: this.guiParams.pointSize },
        lifeCycle: { value: this.guiParams.lifeCycle },
        updateProbability: { value: this.guiParams.updateProbability },
        uProgress: { value: 0 },
      },
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
    });
    return material;
  }

  createGradualMaterial() {
    const material = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointSize: { value: this.guiParams.pointSize },
        uColor: { value: new Color(this.guiParams.color) },
        uProgress: { value: 0 },
      },
      vertexShader: gradualVertex,
      fragmentShader: gradualFragment,
      transparent: true,
      depthWrite: false,
    });
    return material;
  }

  update() {
    this.tweenGroup.update();
    // if (!this.material) {
    //   return;
    // }
    // this.time += this.guiParams.speed;
    // this.material.uniforms.time.value = this.time;
  }
}
