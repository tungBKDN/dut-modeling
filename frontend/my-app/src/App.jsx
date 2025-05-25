import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MapComponent from '../component/Map'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MapComponent className="" />
    </>
  )
}

export default App
