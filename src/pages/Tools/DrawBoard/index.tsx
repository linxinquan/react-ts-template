import { useEffect, useRef, useState } from 'react';
import { Button, Slider } from 'antd';
import styles from './index.less';
import DrawBoardHelper from './DrawBoardHelper';
import PicturePointViewer from '@/compos/PictureParticle/PicturePointViewer';

export default function DrawBoard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawBoardRef = useRef<DrawBoardHelper>();
  const [imgUrl, setImgUrl] = useState<string>();

  useEffect(() => {
    if (containerRef.current) {
      drawBoardRef.current = new DrawBoardHelper(containerRef.current);
    }
  }, []);

  const handleClear = () => {
    drawBoardRef.current?.clear();
  };

  const handleLineWidthChange = (width: number) => {
    drawBoardRef.current?.setLineWidth(width);
  };
  const handleGenerate = () => {
    setImgUrl(drawBoardRef.current?.getImageData());
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button onClick={handleClear}>清空画板</Button>
        <div className={styles.lineWidth}>
          <span>线条粗细:</span>
          <Slider
            min={1}
            max={20}
            defaultValue={2}
            onChange={handleLineWidthChange}
            style={{ width: 200 }}
          />
        </div>
        <Button onClick={handleGenerate}>生成</Button>
      </div>
      <div className={styles.content}>
        <div ref={containerRef} className={styles.drawArea} />
        <div className={styles.previewer}>
          <PicturePointViewer imgUrl={imgUrl} />
        </div>
      </div>
    </div>
  );
}
