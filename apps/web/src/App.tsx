import { useState } from 'react'

import './App.css'
import HeatTreatmentChart from "./components/HeatTreatmentChart"

function App() {
  return (
    <>
      <div>
       <HeatTreatmentChart />
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App
