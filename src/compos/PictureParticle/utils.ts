import { BufferAttribute, BufferGeometry, Color } from 'three';

interface PixelColor {
  // 定义 PixelColor 接口，表示像素的颜色信息
  x: number; // 像素的 x 坐标
  y: number; // 像素的 y 坐标
  color: string;
  //   color: { r: number; g: number; b: number }; // 像素的颜色，使用字符串表示
}

function getPixels(imgData: ImageData, onlyLine = false) {
  const { data, width, height } = imgData;
  const pixels: PixelColor[] = [];
  for (let y = 0; y < height; y += 1) {
    // 遍历图像的每一行
    for (let x = 0; x < width; x += 1) {
      // 遍历图像的每一列
      const index = (y * width + x) * 4; // 计算像素在数据数组中的索引
      const alpha = data[index + 3]; // 获取像素的 alpha 值
      if (alpha === 0) continue; // 过滤完全透明像素

      const r = data[index]; // 获取像素的红色值
      const g = data[index + 1]; // 获取像素的绿色值
      const b = data[index + 2]; // 获取像素的蓝色值
      if (onlyLine && r > 50) {
        continue;
      }
      pixels.push({
        x: x - width / 2, // 计算像素的 x 坐标并进行归一化
        y: -y + height / 2, // 计算像素的 y 坐标并进行归一化
        color: `rgb(${r},${g},${b})`, // 将 RGB 值转换为字符串格式的颜色
        // color: { r, g, b },
      });
    }
  }
  return pixels;
}

function loadImage(url: string, onlyLine = false) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  return new Promise<PixelColor[]>((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取 canvas 的 2D 绘图上下文');
      }
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = getPixels(data, onlyLine);
      resolve(pixels);
    };
  });
}

function createGeometry(pixels: PixelColor[]) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(pixels.length * 3);
  const colors = new Float32Array(pixels.length * 3);
  const lifetimes = new Float32Array(pixels.length);
  const velocities = new Float32Array(pixels.length * 3);
  for (let i = 0; i < pixels.length; i += 1) {
    const { x, y, color } = pixels[i];
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    const rgb = new Color(color);
    colors[i * 3] = rgb.r;
    colors[i * 3 + 1] = rgb.g;
    colors[i * 3 + 2] = rgb.b;

    velocities[i * 3] = (Math.random() - 0.5) * 0.1;
    velocities[i * 3 + 1] = Math.random() * 0.2;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

    lifetimes[i] = Math.random() * 4;
  }
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('initialPosition', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));

  geometry.setAttribute('lifetime', new BufferAttribute(lifetimes, 1));
  geometry.setAttribute('velocity', new BufferAttribute(velocities, 3));
  return geometry;
}

function getRandomPositions(count: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = Math.random() * 30 + 1;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * r + (Math.random() - 0.5) * 10;
    const y = Math.sin(angle) * r + (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 2;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

function createMutableGeometry(geometry: BufferGeometry, pixels: PixelColor[], scale: number = 1) {
  // 每隔4个点取一个点，减少数量
  const sampledPixels = pixels.filter((_, index) => index % 4 === 0);
  const positions = new Float32Array(sampledPixels.length * 3);
  const initialPositions = getRandomPositions(sampledPixels.length);
  const velocities = new Float32Array(sampledPixels.length * 3);
  const lifetimes = new Float32Array(sampledPixels.length);

  for (let i = 0; i < sampledPixels.length; i += 1) {
    const { x, y } = sampledPixels[i];
    positions[i * 3] = x * scale;
    positions[i * 3 + 1] = y * scale;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3;

    velocities[i * 3] = (Math.random() - 0.5) * 0.1;
    velocities[i * 3 + 1] = Math.random() * 0.2;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

    lifetimes[i] = Math.random() * 4;
  }
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('initialPosition', new BufferAttribute(initialPositions, 3));
  geometry.setAttribute('velocity', new BufferAttribute(velocities, 3));
  geometry.setAttribute('lifetime', new BufferAttribute(lifetimes, 1));
  return geometry;
}

export { loadImage, getPixels, createGeometry, createMutableGeometry };
export type { PixelColor };
