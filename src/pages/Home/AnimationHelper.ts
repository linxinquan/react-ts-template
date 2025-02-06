import * as THREE from 'three';
import RendererCore from '@/utils/RendererCore';

export default class AnimationHelper {
  private renderer: RendererCore;

  private geometry: THREE.IcosahedronGeometry;

  private material: THREE.MeshPhongMaterial;

  private mesh: THREE.Mesh;

  constructor(renderer: RendererCore) {
    this.renderer = renderer;

    // 创建网格12面体
    this.geometry = new THREE.IcosahedronGeometry(1, 0);
    this.material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.renderer.add(this.mesh);

    // 添加光源
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    this.renderer.add(light);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.renderer.add(ambientLight);

    // 开始动画
    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // 旋转网格12面体
    if (this.mesh) {
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.01;
    }

    this.renderer.render();
  };

  // 清理资源
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
