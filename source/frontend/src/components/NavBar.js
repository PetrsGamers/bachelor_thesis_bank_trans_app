import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import AdbIcon from '@mui/icons-material/Adb';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import useToken from './useToken';
import { useNavigate } from 'react-router';
import { useState,useEffect } from 'react';
import axios from 'axios';


/* This function is creating a main navigation for the whole application,  */
function NavBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);

    let navigate = useNavigate();
  
    const handleOpenNavMenu = (event) => {
      setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };
    const logout =() => {
      localStorage.removeItem("token");
    };
    const [profileForm, setProfileForm] = useState()
    const {token,setToken} = useToken();

    useEffect(() => {
      getData();
    },[])
  /* This function is loading a profile picture */
    function getData() {
      axios({
        method: "GET",
        url:"/user",
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      .then((response) => {
        const res =response.data
        res.access_token && setToken(res.access_token)
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
        navigate(`/login`);
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
    };
  
  return (
<AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/home"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Money Tracker
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >


            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <IconButton component={Link} to="/statements">
                  <Typography textAlign="center" fontWeight="bold" color="white">Statements</Typography>
            </IconButton>
            <IconButton component={Link} to="/graphs">
                  <Typography textAlign="center" fontWeight="bold" color="white">Graphs</Typography>
            </IconButton>
            
          </Box>
          <Tooltip title="Log out">
            <IconButton onClick={logout} component={Link} to="/" sx={{p: 2}} >
              <LogoutIcon/>
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Profile">
              <IconButton component={Link} to="/profile" sx={{ p: 0 }}>
                {profileForm ? (

                  <Avatar alt={profileForm.firstname} src={profileForm.photo} />
                ) : ( <Avatar></Avatar> )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default NavBar