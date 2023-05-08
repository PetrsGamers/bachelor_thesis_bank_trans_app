import * as React from 'react'; import { useState, useEffect } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import axios from 'axios'; import { AppBar, Box, Toolbar, IconButton, Typography, Menu, MenuIcon, Container, Avatar, Button, Tooltip, MenuItem, AdbIcon, Grid, Paper } from '@mui/material'; import Profile from './Profile'; import useToken from './useToken'; import NavBar from './NavBar'; import Upload from './Upload'; import Transactions from './Transactions'; import Graph from './Graph';

/*
Main page for users, this function is going to load data of latest statement, then it will take the latest statement id and then call api endpoint for  all transaction of that statement.
then these data it will pass to the two components and the will display graph and list of transactions
*/
function Home(props) {

  const { token, setToken } = useToken();
  const [statement, setStatement] = useState([])
  const [transactions, setTransaction] = useState([]);

  const loaddata = () => {
    axios({
      method: "GET",
      url: "/lateststatement",
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
      .then(response => {
        console.log(response.data)

        setStatement({  
          month: response.data.month,
          year: response.data.year,
          bank: response.data.bank,
          type: response.data.type,
          income: response.data.income,
          spending: response.data.spending,
          id: response.data.id})
        console.log("statementId: " + response.data.id);
        axios({
          method: "GET",
          url:"/statement/"+response.data.id+"/transactions",
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
          .then(response => setTransaction(response.data)); // set the state variable directly to the response data
      })
      .catch(error => console.error(error));
  }
  useEffect(() => {
    loaddata()
    
  }, []);
  

 

  return (
<>
  <NavBar />

  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Upload loaddata={loaddata} />
          {statement.id ? (          
      <Transactions transactions={transactions} statement_id={statement.id} loaddata={loaddata} />
          ):(
            <p style={{ display: 'flex'}}>
              <b>Please upload your statement from last month</b></p>
          )}


      </div>
    </Grid>
    {statement.id ? (  
    <Grid item xs={12} sm={6}>
    <>
    <Typography fontWeight="bold" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px'}}>
    Last month review               
          </Typography>
    <Graph transactions={transactions} statement_id={statement.id} statementMonth={statement.month} statementYear={statement.year} />
     </>
    </Grid>
    ):(   
       <p></p>
             )}
  </Grid>
</>
  );
}
export default Home;