import React from 'react'
import Login from '../login/Login'

function setToken(userToken) {
  sessionStorage.setItem('token', JSON.stringify(userToken))
}
 

function getToken() {
  const tokenString = sessionStorage.getItem('token')
  const userToken = JSON.parse(tokenString)
  return userToken?.token
} 

const Dashboard = () => {
  const token = getToken()

  if(!token){
      {return <Login setToken={setToken}/>}
  }

  return (
    <div className='text-white font-bold text-2xl'>Dashboard</div>
  )
}

export default Dashboard