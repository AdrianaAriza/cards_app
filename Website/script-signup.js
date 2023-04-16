document.getElementById("signup-form").addEventListener("submit", function(event) {
  // prevent the default form submission behavior
  event.preventDefault();

  // get the form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  // make a POST request to the create endpoint
  fetch('http://127.0.0.1:8000/user/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      password: password,
      email: email,
      role: role
    })
  }).then(response => {
    // handle the response

    // clear the form input
    document.getElementById("signup-form").reset();
  }).catch(error => {
    // handle the error
  });
});
const signinBtn = document.getElementById('signin-btn');
signinBtn.addEventListener('click', () => {
  window.location.href = 'signin.html';
});

