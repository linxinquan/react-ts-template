import { Result } from 'antd';
import { useRouteError } from 'react-router';

export default function ErrorBoundary() {
  const error = useRouteError() as any;
  const status = error?.status || '500';

  const errorMessages: Record<string, { title: string; subTitle: string }> = {
    '404': {
      title: '页面不存在',
      subTitle: '您访问的页面不存在，请检查URL是否正确',
    },
    '403': {
      title: '无权限访问',
      subTitle: '您没有权限访问该页面',
    },
    '500': {
      title: '服务器错误',
      subTitle: '服务器出现问题，请稍后再试',
    },
  };

  const { title, subTitle } = errorMessages[status] || errorMessages['500'];

  return (
    <Result
      status={status as '404' | '403' | '500'}
      title={title}
      subTitle={subTitle}
      extra={[
        <ul key="tips">
          <li>请刷新页面重试</li>
          <li>如果问题持续存在，请联系管理员</li>
        </ul>,
      ]}
    />
  );
}
