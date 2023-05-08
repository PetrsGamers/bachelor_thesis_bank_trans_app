import { useState,useEffect } from 'react'
import { Container,CssBaseline,Box,Typography,TextField,Button,Avatar} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import NavBar from './NavBar';

/*
This function will show all editable textfield for editing profile. All text fields are same as in ER diagram. 
 */


function Profile(props) {

  const [profileForm, setProfileForm] = useState()

  useEffect(() => {
    getData();
  },[])
/* This function loads data that are going to be editable */
  function getData() {
    axios({
      method: "GET",
      url:"/user",
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    .then((response) => {
      const res = response.data
      res.access_token && props.setToken(res.access_token)
      setProfileForm(({
        id: res.id,
        email: res.email,
        password: "",
        matchpassword: "",
        firstname: res.firstname,
        lastname: res.lastname,
        photo: res.photo,
        avg_income: res.avg_income,
        avg_spending: res.avg_spending,
      }))
      console.log(res)

    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  };

  function handleChange(event) { 
    const {value, name} = event.target
    setProfileForm(prevNote => ({
        ...prevNote, [name]: value})
    )};
/* 
This function is validating and sending new data for user.
 */
  function SaveChanges(event){
    event.preventDefault();
    if(profileForm.password !== profileForm.matchpassword)
    {
      toast.error("Password didn't match!")
    }
    else if (profileForm.password == "")
    {
      axios({
        method: "PUT",
        url:"/user/"+profileForm.id,
        headers: {
          Authorization: 'Bearer ' + props.token
        },
        data:{
          email: profileForm.email,
          firstname: profileForm.firstname,
          lastname: profileForm.lastname,
          photo: profileForm.photo,
          avg_income: profileForm.avg_income,
          avg_spending: profileForm.avg_spending
          }
      })
      .then((response) => {
        console.log(profileForm.email)
        toast.success('Profiled data saved succesfull');

      }).catch((error) => {
        toast.error('Error');
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
          }
      })
    }
    else{
      axios({
        method: "PUT",
        url:"/user/"+profileForm.id,
        headers: {
          Authorization: 'Bearer ' + props.token
        },
        data:{
          email: profileForm.email,
          password: profileForm.password,
          firstname: profileForm.firstname,
          lastname: profileForm.lastname,
          photo: profileForm.photo,
          avg_income: profileForm.avg_income,
          avg_spending: profileForm.avg_spending
          }
      })
      .then((response) => {
        console.log(profileForm.email)
        toast.success('Profiled data saved succesfull');

      }).catch((error) => {
        toast.error('Error');
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
          }
      })
    };
  }     

  return (
    <>
    <NavBar/>
    <div className="Profile">
      {profileForm ? (
        <div>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop:2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Profile
          </Typography>
            <Avatar fullWidth alt={profileForm.email} src={profileForm.photo} sx={{ marginTop: 2, marginBottom: 2 }} />
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
              value={profileForm.email}
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
              value={profileForm.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="matchpassword"
              label="Match Password"
              type="password"
              id="matchpassword"
              autoComplete="match-password"
              value={profileForm.matchpassword}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="firstname"
              label="First Name"
              type="firstname"
              id="firstname"
              autoComplete="firstname"
              value={profileForm.firstname}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="lastname"
              label="Last Name"
              type="lastname"
              id="lastname"
              autoComplete="lastname"
              value={profileForm.lastname}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="avg_income"
              label="Average income"
              type="number"
              id="avg_income"
              autoComplete="avg_income"
              value={profileForm.avg_income}
              onChange={handleChange}
              />
            <TextField
              margin="normal"
              fullWidth
              name="avg_spending"
              label="Average spending"
              type="number"
              id="avg_spending"
              autoComplete="avg_spending"
              value={profileForm.avg_spending}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="photo"
              label="Photo"
              type="link"
              id="photo"
              autoComplete="avg_spending"
              value={profileForm.photo}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={SaveChanges}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Container>
        </div>
      ) : (
        <p>Loading profile data...</p>
      )}

    </div>
    </>
  );
}


export default Profile;
