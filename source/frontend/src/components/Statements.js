import React from 'react'
import { useEffect,useState } from 'react';
import useToken from './useToken';
import axios from 'axios';
import { Button,Grid,Table,TableCell,TableContainer,TableBody,TableRow,TableHead,Paper,Dialog,FormControl,DialogActions,DialogContent,DialogContentText,DialogTitle,InputLabel,Select,MenuItem,TextField, Tooltip, Typography } from '@mui/material';
import NavBar from './NavBar';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import Upload from './Upload';

/* This function is loading all users statements and displaying in a editable table  */
function Statements() {
    const [statements, setStatements] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [editForm, seteditForm] = useState({
      month: "",
      year: "",
      bank: "",
      type: "",
      income: "",
      spending: "",
      id: ""
    })
    const [selectedValue, setSelectedValue] = useState('');
    const handleSelectChange = (event) => {
      setSelectedValue(event.target.value);
    };
    const [selectedValue2, setSelectedValue2] = useState('');
    const handleSelectChange2 = (event) => {
      setSelectedValue2(event.target.value);
    };
    const {token} = useToken();
    const loaddata = () => {
      axios({
        method: "GET",
        url:"/allstatements/",
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
        .then(response => setStatements(response.data))
        .then(console.log(statements)) 
    }
    useEffect(() => {
      loaddata()
        }, []);

    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
      };
/* Open editable modal window */
    const handleEdit = (id,month,year,bank,type,income,spending) => {
    setOpen(true)
    seteditForm({  
      month: month,
      year: year,
      bank: bank,
      type: type,
      income: income,
      spending: spending,
      id: id})
          console.log(id,year,spending)
        }
    function handleChange(event) { 
      const {value, name} = event.target
      seteditForm(prevNote => ({
          ...prevNote, [name]: value})
      )}
/* 
  Send new edited data to the server 
*/
      function SubmitPut(event){
        if(editForm.month < 1 || editForm.month > 12)
        {
          toast.error("Wrong month");

        }
        else if(editForm.year < 1 || editForm.year > new Date().getFullYear())
        {
          toast.error("Wrong year");

        }
        else{
          axios({
            method: "PUT",
            url:"/statement/"+editForm.id,
            headers: {
              Authorization: 'Bearer ' + token
            },
            data:{
              month: editForm.month,
              year: editForm.year,
              bank: editForm.bank,
              type: editForm.type,
              income: editForm.income,
              spending: editForm.spending,
              }
          })
          .then((response) => {
            if(response.status ===200)
            {
              loaddata()
              toast.success("Data saved succesfully");
            }
            console.log(editForm.category);
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

      }
      /*
       Sending an api endpoint call delete on statement
       */
      const handleDelete = (id) => {
        axios({
          method: "DELETE",
          url:"/statement/"+id,
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((response) => {
          if(response.status ===200)
          {
            loaddata()
            toast.success("Delete succesfull");
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
      const navigate = useNavigate();
      const handleClickAddStatement = () => {
        setOpen2(true);
      };
      const handleCloseAddStatement = () => {
        setOpen2(false);
      };
      const handleClick = (argument) => {
        navigate(`/statement/${argument}`);
      }


  return (
    <>
    <NavBar/>
    <TableContainer component={Paper}>
    <Table sx={{ minWidth: 650, mb:7, }} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>Month</TableCell>
          <TableCell align="right"><Typography fontWeight="bold">Year</Typography></TableCell>
          <TableCell align="right"><Typography fontWeight="bold">Bank</Typography></TableCell>
          <TableCell align="right"><Typography fontWeight="bold">Type</Typography></TableCell>
          <TableCell align="right"><Typography fontWeight="bold">Income</Typography></TableCell>
          <TableCell align="right"><Typography fontWeight="bold">Spending</Typography></TableCell>
          <TableCell align="right"><Typography fontWeight="bold">View</Typography></TableCell>
          <TableCell align="right"><Typography fontWeight="bold">Edit</Typography></TableCell>
          <TableCell align="right"><Typography fontWeight="bold">Delete</Typography></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {statements.map((statement) => (
          <TableRow
            key={statement.id}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              {statement.month}
            </TableCell>
            <TableCell align="right">{statement.year}</TableCell>
            <TableCell align="right">{statement.bank}</TableCell>
            <TableCell align="right">{statement.type}</TableCell>
            <TableCell align="right">{statement.income} CZK</TableCell>
            <TableCell align="right">{statement.spending} CZK</TableCell>
            <TableCell align="right">
              <Tooltip title="View">
                <ArrowForwardIosIcon onClick={() => handleClick(statement.id,statement.year,statement.month)}/>
              </Tooltip>
            </TableCell>
              
            <TableCell align='right'>
              <Tooltip title='Edit'>
              <EditIcon onClick={() => handleEdit(statement.id,statement.month,statement.year,statement.bank,statement.type,statement.income,statement.spending)} />
              </Tooltip>
                </TableCell>
                <TableCell align='right'>
                <Tooltip title='Delete'>
                  <DeleteIcon onClick={() => handleDelete(statement.id)}></DeleteIcon>
                </Tooltip >
                </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  <Dialog open={open} >
        <DialogTitle>Edit Statement</DialogTitle>
        <DialogContent>
          <DialogContentText>
                Edit the information about the statement
          </DialogContentText>
          <FormControl sx={{ m: 1, minWidth: 80 }}>
      <TextField sx={{m:1}}
        name="month"
        label="Month"
        type="number"
        InputProps={{
          inputProps: { 
              max: 12, min: 1
          }
      }}
        value={editForm.month}
        onChange={handleChange}
      />
      <TextField sx={{m:1}}
        name="year"
        label="Year"
        type="number"
        InputProps={{
          inputProps: { 
              max: 2030, min: 2010
          }
      }}
        value={editForm.year}
        onChange={handleChange}
      />
       
  <Grid>
      <Button onClick={handleClose}>Close</Button>
      <Button type="submit" onClick={SubmitPut}>Edit</Button>
  </Grid>
  </FormControl>
        </DialogContent>
      </Dialog>
      <Fab onClick={() => handleClickAddStatement()} variant="extended" color='primary' style={{
        position: "fixed",
        bottom: "20px",
        right: "20px"
      }}>
  <AddIcon  sx={{ mr: 1 }} />
  Add Statement
</Fab>
<Dialog open={open2} >
      <Upload/>
      <Button onClick={() => handleCloseAddStatement()}>Close</Button>
      </Dialog>

 </>
  )
}

export default Statements