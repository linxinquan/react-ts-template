import MenuLayout from '../Layout/MenuLayout';

export default function GraphHome() {
  return (
    <MenuLayout
      routeParent="/graph"
      items={[
        { key: '/animation', label: '动画' },
        { key: '/shader', label: '着色器' },
        { key: '/cannon', label: '小车' },
        { key: '/shaderTexture', label: '着色贴图' },
        { key: '/loader', label: '模型预览' },
      ]}
    />
  );
}
