import './App.css'
import HeatTreatmentChart from "./components/HeatTreatmentChart"
import EnergyChart from "./components/EnergyChart";

const energyData = {
    today: 132,
    total: 151,
    totalDate: '2024년 7월 1일',
};

function App() {
  return (
    <>
      <div>
        <EnergyChart data={energyData} type="circle" />
        <EnergyChart data={energyData} type="bar" />
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
