// define the sign-in session key
const signinSessionKey = "user_signed_in";

// get the sign-up and sign-in forms
const signupForm = document.getElementById("signup-form");
const signinForm = document.getElementById("signin-form");

// get the sign-in and sign-up buttons
const signinBtn = document.getElementById("signin-btn");
const signupBtn = document.getElementById("signup-btn");

// add an event listener to the sign-up form
signupForm.addEventListener("submit", (event) => {
  // prevent the default form submission behavior
  event.preventDefault();

  // get the form data
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  // make a POST request to the create endpoint
  fetch("http://127.0.0.1:8000/user/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      password: password,
      email: email,
      role: role,
    }),
  })
    .then((response) => {
      // handle the response

      // clear the form input
      document.getElementById("signup-form").reset();
    })
    .catch((error) => {
      // handle the error
    });
});

// add an event listener to the sign-in form
signinForm.addEventListener("submit", (event) => {
  // prevent the default form submission behavior
  event.preventDefault();

  // get the form data
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // make a POST request to the login endpoint
  fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((response) => {
      // handle the response
    })
    .catch((error) => {
      // handle the error
    });

  // make a GET request to the user endpoint
  fetch(`http://127.0.0.1:8000/user?email=${email}&password=${password}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        // set the sign-in session key
        sessionStorage.setItem(signinSessionKey, "true");

        // redirect the user to the dashboard page
        window.location.href = "index-main.html";
      } else {
        // display an error message
        alert("Invalid username or password. Please try again.");
      }
    })
    .catch((error) => {
      // handle the error
      console.error(error);
    });
});

// add an event listener to the sign-in button
const signinBtn = document.getElementById('signin-btn');
signinBtn.addEventListener("click", () => {
  window.location.href = "signin.html";
});

// add an event listener to the sign-up button
signupBtn.addEventListener("click", () => {
  window.location.href = "signup.html";
});

// check if the user is already signed in
if (sessionStorage.getItem(signinSessionKey) === "true") {
  // redirect the user to the dashboard page
  window.location.href = "index.html";
}
