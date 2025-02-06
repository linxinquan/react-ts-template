import { Result } from 'antd';

export default function PageNotFound() {
  return (
    <Result status="404" title="错误">
      <ul>
        <li>请刷新</li>
      </ul>
    </Result>
  );
}
