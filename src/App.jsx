
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RiderHome from './pages/RiderHome'
import DriverHome from './pages/DriverHome'
import BookRidePage from './components/BookRidePage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
		<div> 	
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/signup' element = {<Signup/> }/>
				<Route path='/rider-home' element={
					< ProtectedRoute allowedRole="rider">
						<RiderHome />
					</ProtectedRoute>} />
					
				<Route path='/driver-home' element={
					<ProtectedRoute allowedRole="driver"><DriverHome />
					</ProtectedRoute>
					} />
			
				
			</Routes>
		</div>
  )	
}

export default App
