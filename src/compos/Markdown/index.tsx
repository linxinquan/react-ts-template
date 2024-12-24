import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkNav from 'markdown-navbar';
import styles from './index.less';
import 'markdown-navbar/dist/navbar.css';

interface MarkdownRendererProps {
  textContent?: string;
  path?: string;
}

export default function MarkdownRenderer({ textContent = '', path }: MarkdownRendererProps) {
  const [content, setContent] = useState<string>(textContent);

  useEffect(() => {
    if (!path) {
      return;
    }
    const fetchMark = async () => {
      const res = await fetch(path);
      if (res.ok) {
        const text = await res.text();
        setContent(text);
      }
    };
    fetchMark();
  }, [path]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/github-markdown-css@5.0.0/github-markdown.css';
    document.head.appendChild(link);

    // 清理函数，组件卸载时移除样式
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleNavItemClick = (id: string) => {
    const target = document.querySelector(`[data-id="${id}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sider}>
        <MarkNav
          source={content}
          onNavItemClick={(e, _, hashValue) => {
            handleNavItemClick(hashValue);
          }}
        />
      </div>
      <div className={styles.content}>
        <ReactMarkdown className="markdown-body content" remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
