import React from 'react'
import { useState, useEffect } from 'react';
import { Box,Grid, Paper, Typography } from '@mui/material';
import { PieChart,Pie,Tooltip, ResponsiveContainer,Cell } from 'recharts';
import ColorBoxText from './ColorBoxText';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042' , '#8CBD82', '#FB80C9', '#98FADC', '#FDD384','#F6AAB2', '#988786', '#3D5AC8','#E1C819'];
/* 
  This function read all transaction from the statement and then count all negative transactions and creates a graph with categories. 
*/
function Graph(props) {
  const [amountsByCategory, setAmountsByCategory] = useState([]);
  console.log(props.statementMonth)
  useEffect(() => {
    const amounts = countAmountByCategory(props.transactions);
    setAmountsByCategory(amounts);
  }, [props.transactions]);

  function countAmountByCategory(transactions) {
    const amountsByCategory = {};
    for (const transaction of transactions) {
      const category = transaction.category;
      const amount = transaction.amount;
      if (transaction.amount.toString().startsWith('-')) {
        if (category in amountsByCategory) {
          amountsByCategory[category] += Number(amount);
        } else {
          amountsByCategory[category] = Number(amount);
        }
      }
    }
    const transformedData = Object.entries(amountsByCategory).map(([category, amount]) => ({
      name: category,
      value: Math.abs(Number(amount)),
    }));
    console.log(transformedData);
    return transformedData;
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={250}>
      <Paper style={{ padding: props.xs ? "8px" : "16px" }}>

      <Grid container spacing={2}>
      <Grid item xs={4}>
      <Box sx={{ pb: 2 }}>
        <Typography sx={{ mb: 1 }}>Month: {props.statementMonth}</Typography>
        <Typography>Year: {props.statementYear}</Typography>
      </Box>
        {amountsByCategory.map((section,index) => (
        <>
<div style={{ display: 'flex', alignItems: 'center' }}>
  <ColorBoxText text={section.name} color={COLORS[index % COLORS.length]} />
  <p style={{ marginLeft: '5px' }}>{section.value} CZK</p>
</div>
        </>
        ))
      }
      </Grid>
      <Grid item xs={2}>
        <PieChart width={730} height={250}>
          <Pie data={amountsByCategory} dataKey="value" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
            {amountsByCategory.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </Grid>

      </Grid>
      </Paper>
      </ResponsiveContainer>

    </>
  );
}

export default Graph;