import React from 'react'
import Graph from './Graph'
import NavBar from './NavBar'
import Transactions from './Transactions'
import { useParams } from 'react-router'
import useToken from './useToken'
import { useState,useEffect } from 'react'
import axios from 'axios'
import { Grid } from '@mui/material'
/*
Function that is a main page for detail of statement, this function will load data from API, than display two components.
*/
function Statement(props) {
    const { argument } = useParams();
    const { token } = useToken();
    const [transactions, setTransaction] = useState([]);
    const [statement, setStatement] = useState([])
  
    const loaddata = () => {
          axios({
            method: "GET",
            url:"/statement/"+argument+"/transactions",
            headers: {
              Authorization: 'Bearer ' + token
            }
          })
            .then(response => setTransaction(response.data));
            axios({
              method: "GET",
              url: "/statement/"+argument,
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
               
              })
              .catch(error => console.error(error)); // set the state variable directly to the response data

    }
    /* This allow to reload the component when something change in transactions. */
    useEffect(() => {
      loaddata()
    }, []);

  return (
    /* Displaying two components and sending them arguments with the right data. */
<>
  <NavBar />
  <Grid container>
    <Grid item xs={12} sm={6}>
      <Transactions transactions={transactions} statement_id={argument} loaddata={loaddata} />
    </Grid>
    <Grid item xs={12} sm={6}>
      <Graph transactions={transactions} statement_id={argument} loaddata={loaddata} statementMonth={statement.month} statementYear={statement.year} />
    </Grid>
  </Grid>
</>
  )
}

export default Statement