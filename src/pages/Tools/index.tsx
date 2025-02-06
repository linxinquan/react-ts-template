import MenuLayout from '../Layout/MenuLayout';

export default function GraphHome() {
  return (
    <MenuLayout
      routeParent="/tools"
      items={[
        { key: '/shader', label: '着色器预览' },
        { key: '/drawBoard', label: '画板' },
      ]}
    />
  );
}
