import React from 'react'
import { useState,useEffect } from 'react';
import axios from 'axios';
import useToken from './useToken';
import { Grid,Button,Table,TableCell,TableContainer,TableBody,TableRow,TableHead,Paper,Dialog,TextField,FormControl,DialogContentText,DialogContent,DialogTitle, Typography } from '@mui/material';
import { LineChart, Line } from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

/* 
This function call api endpoint to get all the transactions, then it will display it in table. 
*/

function Transactions(props) {
    const {token,setToken} = useToken();
    const [open, setOpen] = React.useState(false);
    const [editForm, seteditForm] = useState({
        detail: "",
        category: "",
        amount: "",
        id: "",
      })
    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
      };
  

    function handleChange(event) { 
      const {value, name} = event.target
      seteditForm(prevNote => ({
          ...prevNote, [name]: value})
      )}

    const handleEdit = (id,category,amount,detail,other) => {
      setOpen(true)
      seteditForm({  
        detail: detail,
        category: category,
        amount: amount,
        other: other,
        id: id})
      console.log(id,category,amount)
    }

    /*
    This call a api endpoint to delete a specific transaction 
     */
    const handleDelete = (id) => {
      axios({
        method: "DELETE",
        url:"/transaction/"+id,
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      .then((response) => {
        console.log(editForm.category);
        if(response.status === 200)
        {
          props.loaddata();
          toast.success("Delete succesfully");
        }
      })
      .catch((error) => {
        toast.error("Error");
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      })
      .finally(() => {
        setOpen(false);
      });
    }
    /* 
    This call a edit PUT request on transaction
    */
    function SubmitPut(event){
      axios({
        method: "PUT",
        url:"/transaction/"+editForm.id,
        headers: {
          Authorization: 'Bearer ' + token
        },
        data:{
          statement: props.statement_id,
          detail: editForm.detail,
          category: editForm.category,
          amount: editForm.amount,
          other: editForm.other,
          }
      })
      .then((response) => {
        if(response.status === 200)
        {
          props.loaddata();
        }
        console.log(response);
        toast.success("Transaction data saved successfully");
      })
      .catch((error) => {
        toast.error("Error");
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      })
      .finally(() => {
        setOpen(false);
      });
    }
  
    return (
      <>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell><Typography fontWeight="bold">Detail</Typography></TableCell>
            <TableCell align="right" fontWeight="bold"><Typography fontWeight="bold">Category</Typography></TableCell>
            <TableCell align="right" fontWeight="bold"><Typography fontWeight="bold">Amount</Typography></TableCell>
            <TableCell align='right' fontWeight="bold"><Typography fontWeight="bold">Edit</Typography></TableCell>
            <TableCell align='right' fontWeight="bold"><Typography fontWeight="bold">Delete</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.transactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {transaction.detail}
              </TableCell>
              <TableCell align="right">{transaction.category}</TableCell>
              <TableCell align="right">{transaction.amount} CZK</TableCell>
              <TableCell align='right'><EditIcon onClick={() => handleEdit(transaction.id,transaction.category,transaction.amount,transaction.detail,transaction.other)} />
                </TableCell>
                <TableCell align='right'><DeleteIcon onClick={() => handleDelete(transaction.id)}></DeleteIcon>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Dialog open={open} >
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
          Edit the information about the transaction
          </DialogContentText>
          <FormControl sx={{ m: 1, minWidth: 80 }}>
      <TextField sx={{ m: 1}}
        name="detail"
        label="Detail"
        type="text"
        value={editForm.detail}
        onChange={handleChange}
      />
      <TextField sx={{ m: 1}}
        name="amount"
        label="Amount"
        type="number"
        value={editForm.amount}
        onChange={handleChange}
      />
      <TextField sx={{ m: 1}}
        name="category"
        label="Category"
        type="text"
        value={editForm.category}
        onChange={handleChange}
      />
      <TextField sx={{ m: 1}}
        name="other"
        label="Other"
        type="text"
        value={editForm.other}
        onChange={handleChange}
      />
      <Grid>
      <Button type="submit" onClick={SubmitPut}>Edit</Button>
      <Button onClick={handleClose}>Close</Button>
      </Grid>
    </FormControl>
        </DialogContent>
      </Dialog>

      </>
    );
  }
  

export default Transactions