export default class DrawBoardHelper {
  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  isDrawing: boolean = false;

  lastX: number = 0;

  lastY: number = 0;

  lineWidth: number = 2;

  strokeStyle: string = '#000';

  constructor(htmlDom: HTMLDivElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = htmlDom.clientWidth;
    this.canvas.height = htmlDom.clientHeight;
    this.ctx = this.canvas.getContext('2d')!;
    htmlDom.appendChild(this.canvas);

    this.initCanvas();
    this.bindEvents();
  }

  private initCanvas() {
    this.ctx.strokeStyle = this.strokeStyle;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private bindEvents() {
    this.canvas.addEventListener('mousedown', this.startDrawing);
    this.canvas.addEventListener('mousemove', this.draw);
    this.canvas.addEventListener('mouseup', this.stopDrawing);
    this.canvas.addEventListener('mouseout', this.stopDrawing);
  }

  private startDrawing = (e: MouseEvent) => {
    this.isDrawing = true;
    [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
  };

  private draw = (e: MouseEvent) => {
    if (!this.isDrawing) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.stroke();
    [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
  };

  private stopDrawing = () => {
    this.isDrawing = false;
  };

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setLineWidth(width: number) {
    this.lineWidth = width;
    this.ctx.lineWidth = width;
  }

  setColor(color: string) {
    this.strokeStyle = color;
    this.ctx.strokeStyle = color;
  }

  // 获取画布内容为base64
  getImageData(): string {
    return this.canvas.toDataURL();
  }
}
