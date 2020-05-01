customAlert = document.getElementById('alert')
alertMsg = document.getElementById('alert-msg')
closeAlertBtn = document.getElementById('alert-close')

closeAlertBtn.addEventListener('click', (e) => {
  e.preventDefault()
  customAlert.style.display = 'none'
  alertMsg.textContent = ''
})

function sendAlert(error) {
  customAlert.style.display = 'flex'
  alertMsg.textContent = error
}

//socket functions

//register form submit
function registerSetup() {
  socket.on('register', (data) => {
    switchPage('game')
  })
  socket.on('registerError', (error) => {
    sendAlert(error.error)
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

  alertMsg.textContent = ''
}

//login form submit
function loginSetup() {
  socket.on('login', (data) => {
    switchPage('game')
  })
  socket.on('loginError', (error) => {
    sendAlert(error.error)
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

    alertMsg.textContent = ''
  })
}
