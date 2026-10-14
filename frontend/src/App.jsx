import Header from './components/Header.jsx'
import NoticeBar from './components/NoticeBar.jsx'
import Footer from './components/Footer.jsx'
import ExplorePage from './pages/ExplorePage.jsx'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <Header />
      <NoticeBar />
      <main id="main" className="container">
        <ExplorePage />
      </main>
      <Footer />
    </>
  )
}
