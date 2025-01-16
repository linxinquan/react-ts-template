import RendererCore from './RendererCore';

export default function fullscreen(renderer: RendererCore) {
  document.addEventListener('dblclick', () => {
    // 判断当前是否处于全屏模式
    if (document.fullscreenElement) {
      // 退出全屏模式
      document.exitFullscreen();
      return;
    }
    // 全屏展示画布
    renderer.domElement.requestFullscreen();
  });
}
