import { useState } from 'react';
import './app.less';

export default function App() {
  const [value, setValue] = useState<string>('123');
  const myenv = process.env.S3_BUCKET;
  return (
    <div>
      456
      <div className="env">env1: {myenv}</div>
      <input
        value={value}
        onChange={(v) => {
          console.log(v.target.value);
          setValue(v.target.value);
        }}
      />
    </div>
  );
}
