//socket functions

//register form submit
function registerSetup() {
  socket.on('register', (data) => {
    console.log(data)
    switchPage('game')
  })
  socket.on('registerError', (error) => {
    console.error(error)
    document.getElementById('register-alert').textContent = error.error
  })

  registerForm = document.getElementById('register-form')

  //submit register form function
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault()
    username = document.getElementById('username1')
    password1 = document.getElementById('password1')
    password2 = document.getElementById('password2')

    //send data to BE
    socket.emit('register', {
      username: username.value,
      password1: password1.value,
      password2: password2.value,
    })

    //clear input values
    registerForm.reset()
  })
}

//login form submit
function loginSetup() {
  socket.on('login', (data) => {
    console.log('login data:', data)
    switchPage('game')
  })
  socket.on('loginError', (error) => {
    console.error(error)
    alert(error.error)
  })

  loginForm = document.getElementById('login-form')

  //submit login form function
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    username = document.getElementById('username')
    password = document.getElementById('password')

    //send data to BE
    socket.emit('login', {
      username: username.value,
      password: password.value,
    })

    //clear input values
    loginForm.reset()
  })
}
