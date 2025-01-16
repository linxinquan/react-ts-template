import { BufferAttribute, BufferGeometry, Points, Vector3 } from 'three';

import type { ParticleMaterialOptions } from './ParticleMaterial';
import ParticleMaterial from './ParticleMaterial';

interface Particles3DOptions {
  particleCount: number;
  range: number | number[];
  initialZ: number;
  style?: ParticleMaterialOptions;
}

const DefaultOptions: Particles3DOptions = {
  particleCount: 800,
  range: 800,
  initialZ: 0,
  style: {
    fogNear: 300,
    fogFar: 600,
  },
};

export default class Particles3D extends Points {
  private options: Particles3DOptions;

  constructor(options: Partial<Particles3DOptions> = {}) {
    super();
    // this.options = merge({}, DefaultOptions, options) as Particles3DOptions;
    this.options = { ...DefaultOptions, ...options };
    this.parse();
  }

  private parse() {
    const positions = this.generateRandomPosition();
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.computeBoundingBox();
    this.geometry = geometry;
    const pMaterial = new ParticleMaterial(this.options.style);
    this.material = pMaterial;
  }

  updateGeometry(positions: Float32Array) {
    this.geometry.setAttribute('position', new BufferAttribute(positions, 3));
    this.geometry.attributes.position.needsUpdate = true;
  }

  updateParticleCount(count: number): void {
    this.options.particleCount = count;
    const positions = this.generateRandomPosition();
    this.updateGeometry(positions);
  }

  generateRandomPosition() {
    const { range, initialZ, particleCount } = this.options;
    const amount = particleCount * 3;
    const positions = new Float32Array(amount);
    const [xRange, yRange, zRange] = typeof range === 'number' ? [range, range, range] : range;
    for (let i = 0; i < amount; i += 1) {
      positions[i * 3] = Math.random() * xRange - xRange / 2;
      positions[i * 3 + 1] = Math.random() * yRange - yRange / 2;
      positions[i * 3 + 2] = initialZ + Math.random() * zRange - zRange / 2;
    }
    return positions;
  }

  static generateRandomSphere(r: number, particleCount: number) {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      // 随机生成球面的点
      const u = Math.random();
      const v = Math.random();

      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.sin(phi) * Math.sin(theta);
      let z = r * Math.cos(phi);

      // 给每个点随机增加偏移量
      const offset = r / 10;
      const velocity = new Vector3(
        -1 + Math.random() * 2,
        -1 + Math.random() * 2,
        -1 + Math.random() * 2,
      );
      x += velocity.x * offset;
      y += velocity.y * offset;
      z += velocity.z * offset;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }
}
