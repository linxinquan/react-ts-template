import { useContext, useEffect } from 'react';

import { useCreation } from 'ahooks';
import ParticleRenderer from './ParticleRenderer';
import styles from './index.less';
import { RendererContext, RendererViewerHOC } from '../RendererHOC';

function ParticleViewer3D() {
  const renderer = useContext(RendererContext);

  const particleRenderer = useCreation(() => new ParticleRenderer(renderer), [renderer]);

  useEffect(() => {
    if (renderer && particleRenderer) {
      particleRenderer.init();
    }
    return () => {
      if (renderer && particleRenderer) {
        particleRenderer.dispose();
      }
    };
  }, [renderer, particleRenderer]);

  return (
    <div
      className={styles.button}
      onClick={() => {
        particleRenderer?.reset();
      }}
    >
      重新播放
    </div>
  );
}

export default RendererViewerHOC(ParticleViewer3D);
