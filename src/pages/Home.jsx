import { useNavigate } from "react-router-dom"

export default function Home() {

	const navigate =  useNavigate()
	return (

		<div>
			Home Page
			<button onClick={ ()=> navigate('/login')}>
						login
				</button>
		</div>
	)
} 