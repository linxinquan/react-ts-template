import { Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import styles from './index.less';

const { Header } = Layout;

const items = [
  {
    key: '/graph',
    label: '图形学',
  },
  {
    key: '/tools',
    label: '小工具',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout className={styles.layout}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div>logo</div>
        <Menu
          theme="dark"
          mode="horizontal"
          items={items}
          onClick={(e) => {
            navigate(e.key);
          }}
          style={{ flex: 1, minWidth: 0 }}
          activeKey={location.pathname}
        />
      </Header>
      <Outlet />
    </Layout>
  );
}
