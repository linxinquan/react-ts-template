import ParticleViewer3D from '@/compos/ParticleViewer3D';
import styles from './index.less';

export default function Animation() {
  // const handleClick = () => {
  //   request.get('/api/error').then((res) => {
  //     message.config(res.data);
  //   });
  // };
  return (
    <div className={styles.container}>
      <ParticleViewer3D />
    </div>
  );
}
