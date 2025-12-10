import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
    const [message, setMessage] = useState('')

    useEffect(() => {
        // Gọi sang Backend port 8080
        axios.get('http://localhost:8080/api/posts')
            .then(response => {
                setMessage(response.data)
            })
            .catch(error => console.error(error))
    }, [])

    return (
        <div>
            <h1>Website Tìm Thú Thất Lạc</h1>
            <p>Backend says: {message}</p>
        </div>
    )
}

export default App