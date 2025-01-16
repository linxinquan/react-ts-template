import { Upload } from 'antd';
import { UploadChangeParam } from 'antd/es/upload';
import { useState } from 'react';
import styles from './index.less';
import PicturePointViewer from '@/compos/PictureParticle/PicturePointViewer';

const imgPaths = ['/fish.svg', '/fishbone.svg', '/octopus.svg', '/whale.svg'];
export default function ShaderTexture() {
  const [img, setImg] = useState<string>();
  const handleUpload = (info: UploadChangeParam) => {
    const { file } = info;
    if (file.status !== 'uploading') {
      if (file.originFileObj) {
        const url = URL.createObjectURL(file.originFileObj);
        setImg(url);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.viewer}>
        <div className={styles.canvas}>
          <PicturePointViewer imgUrl={img} allPaths={imgPaths} />
        </div>
      </div>
      <div className={styles.list}>
        <div>
          <Upload action="/" name="file" listType="picture-card" onChange={handleUpload}>
            add
          </Upload>
        </div>

        <div className={styles['texture-grid']}>
          {imgPaths.map((url) => (
            <div
              key={url}
              onClick={() => {
                setImg(url);
              }}
            >
              <img src={url} alt={url} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
