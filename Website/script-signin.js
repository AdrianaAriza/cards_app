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
    if (response.status !== 200) {
      throw new Error('Invalid email. Please try again.');
    }
    return response.json();
  })
    .then(user => {
      // set the sign-in session key
      localStorage.setItem(signinSessionKey, JSON.stringify({ token: user['token'] }));
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

const modal = document.getElementById('modal');
const modal2 = document.getElementById('modal2');
const resetPasswordButton = document.getElementById('reset_password');
resetPasswordButton.addEventListener('click', () => {

  // Show the modal
  modal.style.display = 'block';
});

const cancelButton = document.querySelector('#modal .cancel');
cancelButton.addEventListener('click', () => {
  modal.style.display = 'none';
});

const cancelButton2 = document.querySelector('#modal2 .cancel');
cancelButton2.addEventListener('click', () => {
  modal2.style.display = 'none';
});


const sendTokenButton = document.querySelector('#modal .send');
sendTokenButton.addEventListener('click', () => {

  const email = document.getElementById('emailInput').value;
  console.log(email)
  fetch('http://127.0.0.1:8000/send_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email
    })
  }).then(response => {
    if (response.status != 200) {
      alert("Invalid email, please try again")
      modal.style.display = 'none';
    }
    else {
      modal.style.display = 'none';
      modal2.style.display = 'block';
    }
  })

});

const resetButton = document.querySelector('#modal2 .update-password');
resetButton.addEventListener('click', () => {

  const email = document.getElementById('emailInput2').value;
  const password = document.getElementById('password2').value;
  const token = document.getElementById('token').value;
  console.log(email)
  fetch('http://127.0.0.1:8000/reset_password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password,
      token: token

    })
  }).then(response => {
    if (response.status !== 200) {
      throw new Error('Invalid email. Please try again.');
    }
    return response.json();
  })
  modal2.style.display = 'none';
});
