//socket functions
socket.on("register", (data) => {
  console.log(data);
  switchPage("game");
});
socket.on("registerError", console.error);
socket.on("login", (data) => {
  console.log(data);
  switchPage("game");
});
socket.on("loginError", console.error);

//register form submit
function registerSetup() {
  registerForm = document.getElementById("register-form");

  //submit register form function
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    username = document.getElementById("username1");
    password1 = document.getElementById("password1");
    password2 = document.getElementById("password2");

    //send data to BE
    socket.emit("registration", {
      username: username.value,
      password1: password1.value,
      password2: password2.value,
    });

    //clear input values
    username.value = "";
    password1.value = "";
    password2.value = "";
  });
}

//login form submit
function loginSetup() {
  loginForm = document.getElementById("login-form");

  //submit login form function
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
      username = document.getElementById("username")
      password = document.getElementById("password")

      //send data to BE
    socket.emit("login", {username: username.value, password: password.value});

    //clear input values
    username.value = ""
    password.value = ""
  });
}
