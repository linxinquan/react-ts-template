import MenuLayout from '../Layout/MenuLayout';

export default function GraphHome() {
  return (
    <MenuLayout
      routeParent="/graph"
      items={[
        { key: '/animation', label: '动画' },
        { key: '/shader', label: '着色器' },
      ]}
    />
  );
}
