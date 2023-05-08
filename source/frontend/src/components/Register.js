import React from 'react'
import { Container,CssBaseline,Box,Typography,Link,Grid,TextField,Button,Checkbox, } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

/* 
This function is sending data for registration via button and TextField components to the endpoint 
*/
function Register(props) {
    
  const [loginForm, setloginForm] = useState({
    email: "example@example.com",
    password: "Kilimand1@",
    matchpassword: "Kilimand1@"
  })
  let navigate = useNavigate();

  
    function RegisterIn(event){
      event.preventDefault();
      if(loginForm.password !== loginForm.matchpassword)
      {
        toast.error("Password didn't match!")
      }
      else{
        axios({
          method: "POST",
          url:"/user",
          data:{
            email: loginForm.email,
            password: loginForm.password
           }
        })
        .then((response) => {
          if(response.status === 200)
          {

            navigate('/login')
            toast.success('Register successful, you can now log in');
          }

  
  
        }).catch((error) => {
          if(error.status === 422)
          {
            toast.error('This email already exist!');
          }
          toast.error('Register error');
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })
      }      

    };

    function handleChange(event) { 
      const {value, name} = event.target
      setloginForm(prevNote => ({
          ...prevNote, [name]: value
      }))
      if (name === 'password') {
        setloginForm(prevNote => ({
          ...prevNote, matchpassword: prevNote.matchpassword || ''
        }))
      }
    }
  
    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={RegisterIn} sx={{ mt: 3 }}>
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <TextField
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={loginForm.email}
        onChange={handleChange}
        error={!/\S+@\S+\.\S+/.test(loginForm.email)}
        helperText={/\S+@\S+\.\S+/.test(loginForm.email) ? '' : 'Enter a valid email address'}
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={loginForm.password}
        onChange={handleChange}
        error={!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+~`=[\]{}|\\:;"'<>,.?/-]).{8,}/.test(loginForm.password)}
        helperText={/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+~`=[\]{}|\\:;"'<>,.?/-]).{8,}/.test(loginForm.password) ? '' : 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'}
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        required
        fullWidth
        name="matchpassword"
        label="Password again"
        type="password"
        id="matchpassword"
        value={loginForm.matchpassword}
        onChange={handleChange}
        error={loginForm.password !== loginForm.matchpassword}
        helperText={loginForm.password === loginForm.matchpassword ? '' : 'Passwords do not match'}
      />
    </Grid>
  </Grid>
  <Button
    type="submit"
    fullWidth
    variant="contained"
    sx={{ mt: 3, mb: 2 }}
  >
    Sign Up
  </Button>
  <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/login" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
    );
  }

export default Register