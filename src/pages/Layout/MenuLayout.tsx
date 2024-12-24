import { Layout, Menu, MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import styles from './index.less';

const { Content, Sider } = Layout;
interface MenuLayoutProps {
  items?: MenuProps['items'];
  routeParent?: string;
}
export default function MenuLayout({ routeParent, items = [] }: MenuLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const activeKey = routeParent ? pathname.replace(new RegExp(routeParent, 'g'), '') : pathname;
  const handleSelectItem = (key: string) => {
    navigate(routeParent + key);
  };
  return (
    <Layout className={styles.layout}>
      <Sider className={styles.sider}>
        <Menu
          selectedKeys={[activeKey]}
          items={items}
          style={{ flex: 1, minWidth: 0 }}
          onClick={(info) => handleSelectItem(info.key)}
        />
      </Sider>
      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
}
