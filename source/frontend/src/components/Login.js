import { useState } from 'react';
import axios from "axios";
import { Box, Stack } from '@mui/system'
import { Container, Grid, TextField, Typography,Button,FormControlLabel,Checkbox,Link } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

/* 
This function will send api call with user data to the server, the server will return a token at that token is going to be save in the Local Storage.  
*/

function Login(props) {

    const [loginForm, setloginForm] = useState({
      email: "",
      password: ""
    })
    let navigate = useNavigate();
    
    function logMeIn(event) {
      axios({
        method: "POST",
        url:"/token",
        data:{
          email: loginForm.email,
          password: loginForm.password
        }
      })
      .then((response) => {
        
        console.log(loginForm.email)
        props.setToken(response.data.access_token)
        navigate('/home')
        toast.success('Log in succesfull');

      }).catch((error) => {
        toast.error('Wrong email or password')
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
          }
      })

      setloginForm(({
        email: "",
        password: ""}))

      event.preventDefault()
    }

    function handleChange(event) { 
      const {value, name} = event.target
      setloginForm(prevNote => ({
          ...prevNote, [name]: value})
      )}

    return (
      <> 
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
            Sign in
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={loginForm.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={logMeIn}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item>
                <Link href="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
    );
}

export default Login;