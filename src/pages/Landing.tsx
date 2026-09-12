import Hero from '../components/landing/Hero.tsx'
import HowItWorks from '../components/landing/HowItWorks.tsx'
import Mockup from '../components/landing/Mockup.tsx'
import Nav from '../components/landing/Nav.tsx'

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-100">
      <Nav />
      <main>
        <Hero />
        <Mockup />
        <HowItWorks />
      </main>
    </div>
  )
}
