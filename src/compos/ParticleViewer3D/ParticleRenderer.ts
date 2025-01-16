import * as TWEEN from '@tweenjs/tween.js';
import type { ShaderMaterial } from 'three';
import { Color, Vector3, Group, Fog, Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import MathUtils from '@/utils/MathUtils';

import CheckerBoard3D from './objects/CheckerBoard3D';
import LinesConnection3D from './objects/LinesConnection3D';
import Particles3D from './objects/Particles3D';
import { createDarkMaskShader, transformCoordInLimit } from './utils';
import RendererCore from '@/utils/RendererCore';

const { Tween } = TWEEN;

interface ParticleOptions {
  sphereCount: number;
  sphereRadius: number;
  sphereLineDistance: number;
  sphereConnections: number;
  fallCount: number;
  fallRange: Vector3;
  fallXStep: number;
  fallYStep: number;
  lossCount: number;
  lossSpeed: number;
  lossYStep: number;
}

const DefaultParticleOptions: ParticleOptions = {
  sphereCount: 450,
  sphereRadius: 85,
  sphereLineDistance: 40,
  sphereConnections: 4,
  fallCount: 70,
  fallRange: new Vector3(600, 300, 50),
  fallXStep: 0.8,
  fallYStep: 0.4,
  lossCount: 300,
  lossSpeed: 0.005,
  lossYStep: -0.1,
};

/**
 *
 * @class ParticleRenderer
 * @remark 动画顺序：1.入场动画（粒子整体向右移动/旋转） 2.渐显动画（连线、棋盘渐显） 3.常驻动画（粒子下落、棋盘高亮效果）
 */
export default class ParticleRenderer {
  private renderer: RendererCore;

  private sphereGroup: Group;

  // 球体粒子
  private sphereParticles!: Particles3D;

  // 球体粒子连线
  private linesConnection!: LinesConnection3D;

  // 散落粒子
  private lossParticles!: Particles3D;

  // 下落粒子
  private fallParticles!: Particles3D;

  // 下落粒子连线
  private fallLines!: LinesConnection3D;

  private spherePosition!: Float32Array;

  private rotateVec: Vector3 = new Vector3(0, 0, 0);

  private composer?: EffectComposer;

  private isFinishedEntrance: boolean = false;

  private checkerBoard3d!: CheckerBoard3D;

  private intervalId?: number;

  private particleOption = DefaultParticleOptions;

  private gui: GUI;

  private fogOptions = {
    fogNear: 300,
    fogFar: 600,
  };

  private tweenGroup: TWEEN.Group;

  constructor(renderer: RendererCore) {
    this.renderer = renderer;
    this.sphereGroup = new Group();
    this.tweenGroup = new TWEEN.Group();
    this.gui = new GUI();
  }

  init() {
    const { scene, camera } = this.renderer;
    camera.position.set(0, 0, 300);
    const viewH = camera.position.z * Math.tan((camera.fov * 0.5 * Math.PI) / 180) * 2;
    const viewW = viewH * camera.aspect;
    this.particleOption.fallRange.x = Math.floor(viewW);
    this.particleOption.fallRange.y = Math.floor(viewH);

    scene.background = new Color(0x0c111f);
    const { sphereRadius } = this.particleOption;
    this.fogOptions.fogNear = camera.position.z - sphereRadius;
    this.fogOptions.fogFar = camera.position.z + sphereRadius / 2;
    scene.fog = new Fog(0x0c111f, this.fogOptions.fogNear, this.fogOptions.fogFar);
    this.initSphereParticles();
    this.initFallParticles();
    this.initLossParticles();
    this.initPass();
    this.createGUI();

    this.renderer.animate(this.update.bind(this));
    this.enterAnimation();
    this.renderer.render();
  }

  dispose() {
    this.tweenGroup.removeAll();
    this.renderer.cleanup(
      this.sphereGroup,
      this.lossParticles,
      this.fallParticles,
      this.fallLines,
      this.checkerBoard3d,
    );

    this.renderer.cancelAnimate();
    this.gui.destroy();
    this.deactivate();
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  reset() {
    this.dispose();
    this.sphereGroup = new Group();
    this.tweenGroup = new TWEEN.Group();
    this.gui = new GUI();
    this.init();
  }

  // 初始化球体粒子系统
  private initSphereParticles() {
    const { sphereCount, sphereRadius } = this.particleOption;
    this.sphereParticles = new Particles3D({
      particleCount: sphereCount,
      style: {
        ...this.fogOptions,
      },
    });
    this.spherePosition = Particles3D.generateRandomSphere(sphereRadius, sphereCount);
    this.linesConnection = new LinesConnection3D(sphereCount, {
      limitConnections: true,
    });
    this.sphereGroup.add(this.sphereParticles, this.linesConnection);
    this.sphereGroup.position.setY(0);
    this.renderer.add(this.sphereGroup);
  }

  private updateSphere() {
    this.spherePosition = Particles3D.generateRandomSphere(
      this.particleOption.sphereRadius,
      this.particleOption.sphereCount,
    );
    this.sphereParticles.updateGeometry(this.spherePosition);
    this.linesConnection.updateGeometry(this.spherePosition);
  }

  private initLossParticles() {
    this.lossParticles = new Particles3D({
      particleCount: this.particleOption.lossCount,
      range: 500,
      style: {
        fogFar: 1000,
        pointSize: 2,
      },
    });
    this.renderer.add(this.lossParticles);
  }

  // 初始下落粒子系统
  private initFallParticles() {
    const { fallCount, fallRange } = this.particleOption;
    this.fallParticles = new Particles3D({
      particleCount: fallCount,
      initialZ: 100,
      range: fallRange.toArray(),
      style: {
        fogFar: 1000,
        pointSize: 2,
      },
    });
    this.fallLines = new LinesConnection3D(fallCount);
    this.renderer.add(this.fallParticles, this.fallLines);
  }

  private initCheckerBoard() {
    this.checkerBoard3d = new CheckerBoard3D();
    this.checkerBoard3d.rotation.set(MathUtils.degToRad(-60), 0, 0);
    this.checkerBoard3d.position.set(0, -120, 50);
    this.renderer.add(this.checkerBoard3d);
  }

  private initPass() {
    const { scene, camera, renderer, domElement } = this.renderer;
    this.composer = new EffectComposer(renderer);
    const renderModel = new RenderPass(scene, camera);
    const bloomOptions = { strength: 0.4, radius: 0.25, threshold: 0.1 };
    // 光晕和模糊
    const bloomPass = new UnrealBloomPass(
      new Vector2(domElement.clientWidth, domElement.clientHeight),
      0.4,
      0.25,
      0.1,
    );
    bloomPass.strength = bloomOptions.strength;
    bloomPass.radius = bloomOptions.radius;
    bloomPass.threshold = bloomOptions.threshold;
    // 暗角蒙层
    const effectDarkMask = new ShaderPass(createDarkMaskShader());
    this.composer.addPass(renderModel);
    this.composer.addPass(bloomPass);
    this.composer.addPass(effectDarkMask);
    this.composer.setSize(domElement.clientWidth, domElement.clientHeight);
    this.renderer.addEventListener('afterRender', this.renderComposer);
    const bloomFolder = this.gui.addFolder('Bloom');
    bloomFolder.add(bloomOptions, 'strength', 0, 1, 0.1).onChange((value) => {
      bloomPass.strength = value;
      this.renderComposer();
    });
    bloomFolder.add(bloomOptions, 'radius', 0, 1, 0.05).onChange((value) => {
      bloomPass.radius = value;
      this.renderComposer();
    });
    bloomFolder.add(bloomOptions, 'threshold', 0, 1, 0.1).onChange((value) => {
      bloomPass.threshold = value;
      this.renderComposer();
    });
  }

  private renderComposer = () => {
    if (this.composer) {
      const { domElement } = this.renderer;
      this.composer.setSize(domElement.clientWidth, domElement.clientHeight);
      this.composer.render();
    }
  };

  private createGUI() {
    const sphereFolder = this.gui.addFolder('sphere');
    sphereFolder.add(this.particleOption, 'sphereRadius', 1, 400, 1).onChange((value) => {
      this.particleOption.sphereRadius = value;
      this.updateSphere();
    });
    sphereFolder.add(this.particleOption, 'sphereCount', 10, 1000, 10).onChange((value) => {
      this.particleOption.sphereCount = value;
      this.updateSphere();
    });
    sphereFolder.add(this.particleOption, 'sphereLineDistance', 1, 200, 1).onChange((value) => {
      this.particleOption.sphereLineDistance = value;
      this.linesConnection.updateOptions({ minDistance: value });
      this.linesConnection.updateGeometry(this.spherePosition);
    });
    sphereFolder.add(this.particleOption, 'sphereConnections', 0, 10, 1).onChange((value) => {
      this.particleOption.sphereConnections = value;
      this.linesConnection.updateOptions({ maxConnections: value });
      this.linesConnection.updateGeometry(this.spherePosition);
    });

    const particlesFolder = this.gui.addFolder('particles');
    particlesFolder.add(this.particleOption, 'lossCount', 0, 500, 10).onChange((value) => {
      this.particleOption.lossCount = value;
      this.lossParticles.updateParticleCount(value);
      this.renderer.render();
    });
    particlesFolder.add(this.particleOption, 'fallCount', 0, 500, 10).onChange((value) => {
      this.particleOption.fallCount = value;
      this.fallParticles.updateParticleCount(value);
      const positions = this.fallParticles.geometry.getAttribute('position');
      this.fallLines.updateGeometry(new Float32Array(positions.array));
      this.renderer.render();
    });
    particlesFolder.add(this.particleOption, 'fallYStep', 0, 10).onChange((value) => {
      this.particleOption.fallYStep = value;
      this.renderer.render();
    });
  }

  private activate() {
    this.renderer.domElement.addEventListener('pointermove', this.handlePointerMove);
    document.addEventListener('dblclick', () => {
      // 判断当前是否处于全屏模式
      if (document.fullscreenElement) {
        // 退出全屏模式
        document.exitFullscreen();
        return;
      }
      // 全屏展示画布
      this.renderer.domElement.requestFullscreen();
    });
  }

  private deactivate() {
    this.renderer.domElement.removeEventListener('pointermove', this.handlePointerMove);
    this.renderer.removeEventListener('afterRender', this.renderComposer);
  }

  private handlePointerMove = (event: PointerEvent) => {
    const { domElement } = this.renderer;
    const increase = 20;
    const ndc = MathUtils.screenToNdc(domElement, event.clientX, event.clientY);
    this.rotate(MathUtils.degToRad(-ndc.y * increase), MathUtils.degToRad(ndc.x * increase));
  };

  private rotate(rotateX: number, rotateY: number) {
    const increment = new Vector3(rotateX, rotateY, 0).sub(this.rotateVec);
    this.rotateVec.add(increment);
    this.sphereGroup.rotation.setFromVector3(this.rotateVec);
  }

  // 1.1 入场动画 球体粒子沿Y轴旋转
  private enterAnimation() {
    const rotationY = 1.5;
    const { y } = this.sphereGroup.rotation;
    const tween = new Tween(this.sphereGroup.rotation)
      .to({ y: y + rotationY }, 2000)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .onComplete(() => {
        this.sphereGroup.updateMatrixWorld();
        this.rotateVec.set(0, rotationY, 0);
        this.sphereAnimation();
      });
    tween.start();
    this.tweenGroup.add(tween);
  }

  // 1.2 入场动画 球体粒子聚拢
  private sphereAnimation() {
    const startPositions = this.sphereParticles.geometry.getAttribute('position');
    const endPositions = Array.from(this.spherePosition);
    for (let i = 0; i < startPositions.count; i += 1) {
      const endIndex = i % endPositions.length;
      const tween = new Tween(startPositions.array)
        .to(
          {
            [i * 3]: endPositions[endIndex * 3] || 0,
            [i * 3 + 1]: endPositions[endIndex * 3 + 1] || 0,
            [i * 3 + 2]: endPositions[endIndex * 3 + 2] || 0,
          },
          1500,
        )
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate(() => {
          startPositions.needsUpdate = true;
        })
        .onComplete(() => {
          if (i === startPositions.count - 1) {
            // 完成入场
            this.isFinishedEntrance = true;
            this.linesConnection.updateGeometry(this.spherePosition);
            // 2.1 渐显动画 球体连线渐显
            const tween2 = new Tween(this.linesConnection.material)
              .to({ opacity: 1 }, 1000)
              .easing(TWEEN.Easing.Linear.None)
              .onComplete(() => {
                this.activate();
              })
              .start();

            // 2.2 渐显动画 下落连线渐显
            const tween3 = new Tween(this.fallLines.material)
              .to({ opacity: 1 }, 3000)
              .easing(TWEEN.Easing.Linear.None)
              .start();
            this.tweenGroup.add(tween2, tween3);
            // this.checkerBoardAnimation();
          }
        })
        .start();
      this.tweenGroup.add(tween);
    }
  }

  private checkerBoardAnimation() {
    const material = this.checkerBoard3d.material as ShaderMaterial;
    const gridSize = this.checkerBoard3d.getPlaneSize();
    // 2.3 渐显动画 棋盘渐显
    const tween = new Tween(material.uniforms.opacity)
      .to({ value: 0.06 }, 2000)
      .easing(TWEEN.Easing.Linear.None)
      .onComplete(() => {
        // 3.1 常驻动画 随机格子高亮
        const highLightTween = new Tween(material.uniforms.highLightOpacity)
          .to({ value: 0.25 }, 1000)
          .yoyo(true)
          .repeat(1);
        this.intervalId = window.setInterval(() => {
          material.uniforms.highLightCoord.value = ParticleRenderer.getRandomEvenCoord(gridSize);
          highLightTween.start();
          material.uniformsNeedUpdate = true;
        }, 2200);
      })
      .start();
    this.tweenGroup.add(tween);
  }

  // 随机生成x+y为偶数的坐标
  static getRandomEvenCoord(gridSize: Vector2) {
    let randomX;
    let randomY;
    const maxLoop = 1000;
    for (let i = 0; i < maxLoop; i += 1) {
      randomX = Math.floor(Math.random() * gridSize.x);
      randomY = Math.floor(Math.random() * gridSize.y);
      if ((randomX + randomY) % 2 === 0) {
        break;
      }
    }
    return new Vector2(randomX, randomY);
  }

  private fallAnimation() {
    if (!this.fallParticles) {
      return;
    }
    const { fallCount, fallRange, fallXStep, fallYStep } = this.particleOption;
    const fallPositions = this.fallParticles.geometry.getAttribute('position');
    const position = fallPositions.array;
    // 1.3 入场动画 粒子沿X轴正方向移动
    // 3.2 常驻动画 粒子沿Y轴负方向移动
    const step = this.isFinishedEntrance ? -fallYStep : fallXStep;
    const fallLimit = this.isFinishedEntrance ? -fallRange.y / 2 : fallRange.x / 2;
    for (let i = 0; i < fallCount; i += 1) {
      const index = this.isFinishedEntrance ? i * 3 + 1 : i * 3;
      position[index] = transformCoordInLimit(position[index], step, fallLimit);
    }
    this.fallParticles.updateGeometry(new Float32Array(position));
    // 重新计算连线
    this.fallLines.updateGeometry(new Float32Array(position));
  }

  private lossParticlesAnimation() {
    const { fallRange, lossYStep } = this.particleOption;
    const lossPositions = this.lossParticles.geometry.getAttribute('position');
    const position = lossPositions.array;
    // 3.3 常驻动画 散落粒子沿Y轴负方向移动
    for (let i = 0; i < lossPositions.count; i += 1) {
      const index = i * 3 + 1;
      position[index] = transformCoordInLimit(position[index], lossYStep, -fallRange.y);
    }
    this.lossParticles.updateGeometry(new Float32Array(position));
  }

  private update() {
    this.tweenGroup.update();
    this.fallAnimation();
    if (this.isFinishedEntrance) {
      this.lossParticlesAnimation();
    } else {
      // 1.4 入场动画 散落粒子沿Y轴旋转
      this.lossParticles.rotation.y += this.particleOption.lossSpeed;
    }
  }
}
