import { Button, message } from 'antd';
import request from '@/utils/request';

export default function Animation() {
  const handleClick = () => {
    request.get('/api/error').then((res) => {
      message.config(res.data);
    });
  };
  return (
    <div>
      Animation
      <Button onClick={handleClick}>请求</Button>
    </div>
  );
}
