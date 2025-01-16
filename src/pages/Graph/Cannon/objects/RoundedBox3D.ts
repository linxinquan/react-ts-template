import { CanvasTexture, Mesh, MeshBasicMaterial } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export default class RoundedBox3D extends Mesh {
  constructor() {
    const geom = new RoundedBoxGeometry(1, 1, 1, 3, 0.1);
    const materials = [
      new MeshBasicMaterial({
        map: new CanvasTexture(RoundedBox3D.getCanvas(1)),
      }),
      new MeshBasicMaterial({
        map: new CanvasTexture(RoundedBox3D.getCanvas(2)),
      }),
      new MeshBasicMaterial({
        map: new CanvasTexture(RoundedBox3D.getCanvas(3)),
      }),
      new MeshBasicMaterial({
        map: new CanvasTexture(RoundedBox3D.getCanvas(4)),
      }),
      new MeshBasicMaterial({
        map: new CanvasTexture(RoundedBox3D.getCanvas(5)),
      }),
      new MeshBasicMaterial({
        map: new CanvasTexture(RoundedBox3D.getCanvas(6)),
      }),
    ];
    // const material = new MeshBasicMaterial({
    //   color: 0xf3f3f3,
    //   map: new CanvasTexture(RoundedBox3D.getCanvas()),
    // });
    super(geom, materials);
  }

  static getCanvas(type: number = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = '#f3f3f3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    const color = type % 2 ? '#153f87' : '#d30704';
    ctx.fillStyle = color;
    switch (type) {
      case 2:
        ctx.arc(250, 125, 75, 0, Math.PI * 2);
        ctx.arc(250, 375, 75, 0, Math.PI * 2);
        break;
      case 3:
        ctx.arc(125, 125, 60, 0, Math.PI * 2);
        ctx.arc(250, 250, 60, 0, Math.PI * 2);
        ctx.arc(375, 375, 60, 0, Math.PI * 2);
        break;
      case 4:
        ctx.arc(125, 125, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(125, 375, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(375, 125, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(375, 375, 60, 0, Math.PI * 2);
        break;
      case 5:
        ctx.arc(125, 125, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(125, 375, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(250, 250, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(375, 125, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(375, 375, 60, 0, Math.PI * 2);
        break;
      case 6:
        ctx.arc(150, 100, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(150, 250, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(150, 400, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(350, 100, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(350, 250, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(350, 400, 50, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        ctx.arc(250, 250, 100, 0, Math.PI * 2);
        break;
    }
    ctx.fill();
    ctx.closePath();

    return canvas;
  }
}
