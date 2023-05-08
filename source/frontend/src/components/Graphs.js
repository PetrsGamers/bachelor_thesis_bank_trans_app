import React from 'react'
import NavBar from './NavBar'
import useToken from './useToken';
import axios from 'axios';
import { useState,useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line,LineChart } from 'recharts';
import { YearCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { Typography,Box,Grid } from '@mui/material';

/*
  This function creates a three components in the page which consist of YearCalendar for selecting the year in calendar,
*/

function Graphs() {
  const [trStatements, setTrStatements] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const {token} = useToken();
  /*
  This function is getting the data ready for the graph component, also transforming the month in number to a readable format and sorting the data by order. 
   */
  function transformData(statements, year) {
    const monthOrder = {
      "January": 0,
      "February": 1,
      "March": 2,
      "April": 3,
      "May": 4,
      "June": 5,
      "July": 6,
      "August": 7,
      "September": 8,
      "October": 9,
      "November": 10,
      "December": 11,
    };
    const transformedData = statements
      .filter(({ year: statementYear }) => statementYear === year)
      .map(({ id, month, income, spending }) => ({
        id,
        month: getMonthName(month),
        income,
        spending
      }))
      .sort((a, b) => monthOrder[a.month] - monthOrder[b.month]);
  
    console.log(transformedData);
    console.log(year);
  
    return transformedData;
  
  }
    /*
  This function loads data.
   */
  const loaddata = () => {
    axios({
      method: "GET",
      url:"/allstatements/",
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    .then(response => {
      console.log(response.data)
      const data = transformData(response.data, selectedYear);
      setTrStatements(data);

    })
    .catch(error => {
      console.error(error);
    });
  }

  useEffect(() => {
    loaddata()
  }, [selectedYear]);
// Transforming month number to name
  function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
  
    return date.toLocaleString('en-US', { month: 'long' });
  }
// Grid for 3 new components, automatically updated when selected year changed.
  return (
<>
  <NavBar />
  <Typography sx={{ margin: "2px" }} variant="h4" align="center">Graphs</Typography>
  <Typography sx={{ margin: "2px" }} variant="h6" align="center">Choose a year and see your spending and income in graphs</Typography>
  <Grid container spacing={2} sx={{ mt: "20px" }}>
    <Grid item xs={12} sm={4}>
      <Box display="flex" justifyContent="center">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <YearCalendar
            onChange={(newYear) => setSelectedYear(newYear.year())}
            maxDate="2030"
            minDate="2010"
            yearsPerRow="3"
            sx={{ mx: "auto" }}
            style={{ height: "300px", width: "100%" }}
          />
        </LocalizationProvider>
      </Box>
      <Typography variant="h6" align="center" sx={{ mt: "10px" }}>Yearly Calendar</Typography>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Box display="flex" justifyContent="center">
        <BarChart
          width={500}
          height={300}
          data={trStatements}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="green" />
          <Bar dataKey="spending" fill="red" />
        </BarChart>
      </Box>
      <Typography variant="h6" align="center" sx={{ mt: "10px" }}>Income vs Spending</Typography>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Box display="flex" justifyContent="center">
        <LineChart
          width={500}
          height={300}
          data={trStatements}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="spending" stroke="red" />
        </LineChart>
      </Box>
      <Typography variant="h6" align="center" sx={{ mt: "10px" }}>Monthly Spending</Typography>
    </Grid>
  </Grid>
</>
  );
}

export default Graphs