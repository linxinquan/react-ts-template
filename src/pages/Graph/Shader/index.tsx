import MarkdownRenderer from '@/compos/Markdown';

export default function Shader() {
  return (
    <div style={{ height: '100%' }}>
      <MarkdownRenderer path="/markdown/Threejs图形学.md" />
    </div>
  );
}
