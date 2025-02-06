import { Input, Select } from 'antd';
import { useContext, useEffect, useRef } from 'react';
import { useCreation } from 'ahooks';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min';
import { Color } from 'three';
import { RendererContext, RendererViewerHOC } from '@/compos/RendererHOC';
import Editor, { DefaultFragment, DefaultVertex } from './Editor';
import { borderShader, stripeShader } from './shaders';
import styles from './index.less';

const { TextArea } = Input;

function ShaderTool() {
  const renderer = useContext(RendererContext);
  const editor = useCreation(() => new Editor(renderer), [renderer]);

  const guiRef = useRef<GUI>();
  const guiParams = useRef({ color: '#bb5858' });

  useEffect(() => {
    guiRef.current = new GUI();
    guiRef.current.addColor(guiParams.current, 'color').onChange((value) => {
      editor.setUniform('color', new Color(value));
    });
    return () => {
      if (guiRef.current) {
        guiRef.current.destroy();
      }
    };
  }, []);

  const handleUpdateVertex = (value: string) => {
    editor.updateVertex(value);
  };

  const handleUpdateFragment = (value: string) => {
    editor.updateFragment(value);
  };

  const handleSetUniform = (string: string) => {
    const [key, value] = string.split(',');
    editor.setUniform(key, value);
  };

  const handleUpdateGeom = (value: string) => {
    editor.updateGeom(value);
  };

  const handleSelectShader = (key: string) => {
    switch (key) {
      case 'border':
        editor.updateVertex(borderShader.vertex);
        editor.updateFragment(borderShader.fragment);
        break;
      case 'stripe':
        editor.updateVertex(stripeShader.vertex);
        editor.updateFragment(stripeShader.fragment);
        break;

      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <div>
        选择图形
        <Select
          defaultValue="box"
          options={[
            { value: 'box', label: 'box' },
            { value: 'sphere', label: 'sphere' },
            { value: 'cylinder', label: 'cylinder' },
            { value: 'plane', label: 'plane' },
          ]}
          onChange={handleUpdateGeom}
        />
      </div>
      <div>
        选择内置shader
        <Select
          options={[
            { value: 'border', label: 'border' },
            { value: 'stripe', label: 'stripe' },
          ]}
          onChange={handleSelectShader}
        />
      </div>
      <div>
        <div>set uniform</div>
        <Input
          onBlur={(event) => {
            handleSetUniform(event.target.value);
          }}
        />
      </div>
      <div>
        <div>vertex shader</div>
        <TextArea
          defaultValue={DefaultVertex}
          onBlur={(event) => {
            handleUpdateVertex(event.target.value);
          }}
        />
      </div>
      <div>
        <div>fragment shader</div>
        <TextArea
          defaultValue={DefaultFragment}
          onBlur={(event) => {
            handleUpdateFragment(event.target.value);
          }}
        />
      </div>
    </div>
  );
}

export default RendererViewerHOC(ShaderTool);
