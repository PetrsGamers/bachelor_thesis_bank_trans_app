import React from 'react'
import { Grid,Typography,Paper,Input,Button,FormControl,TextField,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,InputLabel,Select,MenuItem } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import useToken from './useToken';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Ring } from 'react-awesome-spinners'

function Upload(props) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const { token, setToken, removeToken } = useToken();
    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
        setFileName(event.target.files[0].name);
    };
    const navigate = useNavigate();
    const [selectedValue, setSelectedValue] = useState('');
    const handleSelectChange = (event) => {
      setSelectedValue(event.target.value);
    };
    const [selectedValue2, setSelectedValue2] = useState('');
    const handleSelectChange2 = (event) => {
      setSelectedValue2(event.target.value);
    };
    const [open, setOpen] = React.useState(false);
    const [editForm, seteditForm] = useState({
        month: "",
        bank: "",
        type: "",
        id: "",
        year: "",
      })
    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
      };
  
    const SumbitPut = () => {
      if( !editForm.year || !editForm.month)
      {
        toast.error("Something is missing")
      }
      else if(editForm.month < 1 || editForm.month > 12)
      {
        toast.error("Wrong month");

      }
      else if(editForm.year < 1 || editForm.year > new Date().getFullYear())
      {
        toast.error("Wrong year");

      }
      else
      {
        axios({
          method: "PUT",
          url:"/statement/"+editForm.id,
          headers: {
            Authorization: 'Bearer ' + token
          },
          data:{
              year: editForm.year,
              month: editForm.month,
              bank: selectedValue,
              type: selectedValue2
            }
        })
        .then((response) => {
          console.log(response);
          toast.success('Saved succesfull');
          setLoading(true)
          axios({ method: "",
                  url:"/analyze/"+editForm.id,
                  headers: {
                    Authorization: 'Bearer ' + token
                  },
        }).then((response) => {
          if(response.status=== 200)
          {
            navigate("/statement/"+editForm.id)
            toast.success("Analysis succesfull")
            props.loaddata()
            setOpen(false);
          }

        }).catch((error) => {
          toast.error("Analysis error")

          setOpen(false);
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })

        }).catch((error) => {
          console.log(error)
          setOpen(true)
          toast.error('Error');
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })}

    };

    const handleFileUpload = () => {
        const formData = new FormData();
        formData.append("file", selectedFile);
        axios
          .post("/statement", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            toast.success('Upload succesfull');
            editForm.id = response.data.id
            setOpen(true);

          }).catch((error) => {
            toast.error('Wrong statement')
            if (error.response) {
              console.log(error.response)
              console.log(error.response.status)
              console.log(error.response.headers)
              }
          })
      };
      function handleChange(event) { 
        const {value, name} = event.target
        seteditForm(prevNote => ({
            ...prevNote, [name]: value})
        )}
  
    
    return (
        <div>
          <Typography fontWeight="bold" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px'}}>
          Upload your statement                 
          </Typography>
          <Paper style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>

        <Input type="file" onChange={handleFileSelect} />
        <Button onClick={handleFileUpload} variant="contained" color="primary">
            Upload
        </Button>
        </Paper>
        <Dialog open={open}>
  <DialogTitle style={{backgroundColor: "#f5f5f5"}}>Add more information about the statement</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Edit the information about the statement you have just uploaded.
    </DialogContentText>
    <form>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
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
            fullWidth
            variant="outlined"
            margin="dense"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
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
            fullWidth
            variant="outlined"
            margin="dense"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel id="bank-select-label">Bank</InputLabel>
            <Select
              id="bank-select"
              value={selectedValue} 
              onChange={handleSelectChange}
              labelId="bank-select-label"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={"Komercni banka"}>Komercni banka</MenuItem>
              <MenuItem value={"Fio"}>Fio</MenuItem>
              <MenuItem value={"Moneta"}>Moneta</MenuItem>
              <MenuItem value={"CSOB"}>CSOB</MenuItem>
              <MenuItem value={"Airbank"}>AirBank</MenuItem>
              <MenuItem value={"UniCredit"}>UniCredit</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              id="type-select"
              value={selectedValue2} 
              onChange={handleSelectChange2}
              labelId="type-select-label"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={"checking"}>Checkings</MenuItem>
              <MenuItem value={"savings"}>Savings</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Button 
        variant="contained" 
        color="primary" 
        style={{marginTop: "16px"}}
        onClick={SumbitPut}
      >
        Analyze
      </Button>
    </form>

    {loading ? (<Ring />):(<p></p>)} 
        </DialogContent>
      </Dialog>
        </div>
    );
}
      

export default Upload