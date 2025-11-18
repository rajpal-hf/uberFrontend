
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RiderHome from './pages/RiderHome'
import DriverHome from './pages/DriverHome'
import BookRidePage from './components/BookRidePage'

function App() {

  return (
		<div> 	
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/signup' element = {<Signup/> }/>
				<Route path='/home' element={<Home />} />
				<Route path='/rider-home' element={<RiderHome />} />
				<Route path='/driver-home' element={<DriverHome />} />
				<Route path='/book-ride' element={<BookRidePage />} />
			</Routes>
		</div>
  )
}

export default App
