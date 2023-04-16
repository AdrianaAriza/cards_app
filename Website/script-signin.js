// define the sign-in session key
const signinSessionKey = "user_signed_in";

// add an event listener to the sign-up button
const signupBtn = document.getElementById('signup-btn');
signupBtn.addEventListener('click', () => {
  window.location.href = 'signup.html';
});

// add an event listener to the sign-in form
const form = document.getElementById('signin-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  
  // get the form data
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // check if the email is valid
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    alert('Invalid email format. Please enter a valid email address.');
    return;
  }

  // make a GET request to the user endpoint
  /**const requestOptions = {
    mode: 'cors',
    method: 'POST',
    redirect: 'follow'
  };**/

fetch('http://127.0.0.1:8000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      password: password,
      email: email
    })
    }).then(response => {
      if (response.status != 200) {
        throw new Error('Invalid email. Please try again.');
      }
      return response.json();
    })
    .then(user => {
      // set the sign-in session key
      localStorage.setItem(signinSessionKey, JSON.stringify({token: user['token']}));
      // redirect the user to the dashboard page
      window.location.href = 'recognition.html';
    })
    .catch(error => {
      // display an error message
      alert(error.message);
    });
});

// check if the user is already signed in
if (localStorage.getItem(signinSessionKey)) {
  // redirect the user to the dashboard page
  window.location.href = 'recognition.html';
}

