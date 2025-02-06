import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router';
import styles from './index.less';

const { Header } = Layout;

const items = [
  {
    key: '/graph',
    label: '图形学',
  },
  {
    key: '/tools',
    label: '工具',
  },
];

export default function LayoutHome() {
  const navigate = useNavigate();

  return (
    <Layout className={styles.home}>
      <Header className={styles.header}>
        <div>logo</div>
        <Menu
          theme="dark"
          mode="horizontal"
          items={items}
          onClick={(e) => {
            navigate(e.key);
          }}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Outlet />
    </Layout>
  );
}
