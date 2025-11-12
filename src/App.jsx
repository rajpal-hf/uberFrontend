
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RiderHome from './pages/RiderHome'

function App() {

  return (
		<div>
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/signup' element = {<Signup/> }/>
				<Route path='/home' element={<Home />} />
				<Route path='/rider-home' element={<RiderHome/> } />

			</Routes>
		
		</div>
  )
}

export default App
