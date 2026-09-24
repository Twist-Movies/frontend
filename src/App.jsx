import Header from './components/Header';
import Hero from './components/Hero';
import MovieCarousel from './components/MovieCarousel';
import About from './components/About';
import Footer from './components/Footer';

import './App.css';

function App() {
  return (
    <>
      <Header />

      <main>
        <Hero />

        <MovieCarousel />

        <About />
      </main>

      <Footer />
    </>
  );
}

export default App;