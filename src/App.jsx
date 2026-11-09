import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import AssessmentIntroPage from './pages/AssessmentIntroPage.jsx'
import AssessmentPage from './pages/AssessmentPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import GrowthTimelinePage from './pages/GrowthTimelinePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/assessment-intro" element={<AssessmentIntroPage />} />
      <Route path="/assessment" element={<AssessmentPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/growth" element={<GrowthTimelinePage />} />
    </Routes>
  )
}
