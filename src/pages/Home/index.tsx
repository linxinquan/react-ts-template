/* eslint-disable consistent-return */
/* eslint-disable no-return-assign */
import { useEffect, useRef } from 'react';
import styles from './index.less';
import ParticleViewer3D from '@/compos/ParticleViewer3D';
import { RendererViewerHOC } from '@/compos/RendererHOC';

function Home() {
  // const renderer = useContext(RendererContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      sectionRefs.current.forEach((section) => {
        if (!section) return;

        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        // Calculate how far the section is through the viewport
        const scrollProgress =
          (scrollPosition - (sectionTop - windowHeight)) / (sectionHeight + windowHeight);

        if (scrollProgress > 0 && scrollProgress < 1) {
          // Apply animations based on scroll progress
          section.style.opacity = Math.min(scrollProgress * 2, 1).toString();
          section.style.transform = `translateY(${(1 - scrollProgress) * 50}px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <section className={styles.particle}>
        <ParticleViewer3D />
      </section>
      <section
        ref={(el) => (sectionRefs.current[0] = el as HTMLDivElement)}
        className={`${styles.section} ${styles.welcomeSection}`}
      >
        <h1 className={styles.welcomeTitle}>Welcome</h1>
        <p className={styles.welcomeText}>Scroll down to explore</p>
      </section>

      <section
        ref={(el) => (sectionRefs.current[1] = el as HTMLDivElement)}
        className={`${styles.section} ${styles.contentSection}`}
      >
        <h2 className={styles.sectionTitle}>Section 1</h2>
        <p className={styles.sectionText}>Content fades in as you scroll</p>
      </section>

      <section
        ref={(el) => (sectionRefs.current[2] = el as HTMLDivElement)}
        className={`${styles.section} ${styles.contentSection} ${styles.whiteSection}`}
      >
        <h2 className={styles.sectionTitle}>Section 2</h2>
        <p className={styles.sectionText}>More animated content</p>
      </section>

      <section
        ref={(el) => (sectionRefs.current[3] = el as HTMLDivElement)}
        className={`${styles.section} ${styles.finalSection}`}
      >
        <h2 className={styles.finalTitle}>Section 3</h2>
        <p className={styles.finalText}>Final section with smooth animations</p>
      </section>
    </div>
  );
}

export default RendererViewerHOC(Home);
