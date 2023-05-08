import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import Welcome from './components/Welcome'
import useToken from './components/useToken'
import Register from './components/Register'
import { ToastContainer } from 'react-toastify'
import Profile from './components/Profile';
import Statement from './components/Statement';
import Graphs from './components/Graphs'
import "react-toastify/dist/ReactToastify.css";
import Statements from './components/Statements'
/*
This function controls the whole app and defines its routes and what component should server them.
 */
function App() {
  const { token, setToken } = useToken();
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<Login token={token} setToken={setToken}/>}></Route>
        <Route exact path="/register" element={<Register/>}></Route>  
        <Route exact path="/home" element={<Home token={token} setToken={setToken}/>}></Route>  
        <Route exact path="/profile" element={<Profile token={token} setToken={setToken}/>}></Route>  
        <Route exact path="/" element={<Welcome token={token} setToken={setToken}/>}></Route>  
        <Route exact path="/statements" element={<Statements token={token} setToken={setToken}/>}></Route>  
        <Route exact path="/graphs" element={<Graphs token={token} setToken={setToken}/>}></Route>  
        <Route exact path="/statement/:argument" element={<Statement token={token} setToken={setToken}/>}></Route>  
      </Routes>
    </BrowserRouter> 
      <ToastContainer position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"/>
</>

  );
}

export default App;
