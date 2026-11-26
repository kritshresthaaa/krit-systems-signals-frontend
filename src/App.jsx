import { useEffect, useMemo, useState } from 'react';
import projectsData from './data/projects.json';
import { PALETTES } from './data/palettes';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TechnicalSystems } from './components/TechnicalSystems';
import { Experience } from './components/Experience';
import { ProjectGallery } from './components/ProjectGallery';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { FullscreenModal } from './components/FullscreenModal';

export function App() {
  const allProjects = useMemo(
    () => [
      ...projectsData.technical,
      ...projectsData.campaigns,
      ...projectsData.posters,
    ],
    []
  );

  const carouselPosters = useMemo(
    () =>
      projectsData.posters.filter(
        (item) => item.series === 'campus-it-carousel'
      ),
    []
  );

  const [paletteIdx, setPaletteIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('marketing');
  const [activeSystemSlug, setActiveSystemSlug] = useState(
    projectsData.technical[0].slug
  );
  const [fullscreenPreview, setFullscreenPreview] = useState(null);

  const currentPalette = PALETTES[paletteIdx];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--paper', currentPalette.paper);
    root.style.setProperty('--coral', currentPalette.coral);
    root.style.setProperty('--blue', currentPalette.blue);
    root.style.setProperty('--lime', currentPalette.lime);
  }, [currentPalette]);

  const activeSystemProject =
    projectsData.technical.find((item) => item.slug === activeSystemSlug) ||
    projectsData.technical[0];

  const handleFocusArchitecture = (slug) => {
    setActiveSystemSlug(slug);
    document
      .getElementById('systems')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFocusCreativeWork = (kind) => {
    setActiveTab(kind === 'design' ? 'design' : 'marketing');
    document
      .getElementById('work')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Navbar
        paletteName={currentPalette.name}
        onCyclePalette={() => setPaletteIdx((prev) => (prev + 1) % PALETTES.length)}
      />

      <main id="top">
        <Hero
          allProjects={allProjects}
          onFocusArchitecture={handleFocusArchitecture}
          onFocusCreativeWork={handleFocusCreativeWork}
        />

        <TechnicalSystems
          projects={projectsData.technical}
          activeProject={activeSystemProject}
          onSelectProject={setActiveSystemSlug}
        />

        <Experience />

        <ProjectGallery
          data={projectsData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenFullscreen={(project, src) =>
            setFullscreenPreview({ title: project.title, src, project })
          }
        />

        <About />
        <Contact />
      </main>

      <Footer />

      <FullscreenModal
        preview={fullscreenPreview}
        carouselPosters={carouselPosters}
        onSelectPreview={(project, src) =>
          setFullscreenPreview({ title: project.title, src, project })
        }
        onClose={() => setFullscreenPreview(null)}
      />
    </>
  );
}

export default App;
