const signinSessionKey = "user_signed_in";

const signoutBtn = document.getElementById('sign-out');
signoutBtn.addEventListener('click', () => {
  signOut();
  window.location.href = 'signin.html';
});

const console_adminBtn = document.getElementById('home');
console_adminBtn.addEventListener('click', () => {
  window.location.href = 'recognition.html';
});

function signOut(){
    localStorage.removeItem(signinSessionKey)
    window.location.href = 'signin.html';

}
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('tbody');
    const modal = document.getElementById('myModal');
    const updateForm = document.getElementById('updateForm');
    const updateName = document.getElementById('updateName');
    const updateEmail = document.getElementById('updateEmail');
    const updateRole = document.getElementById('updateRole');

    // Fetch user data from API
    fetch('http://127.0.0.1:8000/user/all')
        .then(response => response.json())
        .then(users => {
            // Function to update a user row in the table
            const updateUserRow = (user) => {
                const row = tbody.querySelector(`tr[data-email="${user.email}"]`);

                if (row) {
                    // Update the row data
                    row.querySelector('.name').textContent = user.name;
                    row.querySelector('.email').textContent = user.email;
                    row.querySelector('.role').textContent = user.role;
                }
            };

            // Loop through each user and create a row in the table
            users.forEach(user => {
                const row = document.createElement('tr');
                row.setAttribute('data-email', user.email);

                const nameData = document.createElement('td');
                nameData.textContent = user.name;
                nameData.classList.add('name');
                row.appendChild(nameData);

                const emailData = document.createElement('td');
                emailData.textContent = user.email;
                emailData.classList.add('email');
                row.appendChild(emailData);

                const roleData = document.createElement('td');
                roleData.textContent = user.role;
                roleData.classList.add('role');
                row.appendChild(roleData);

                const actionData = document.createElement('td');

                // Create update button for each user
                const updateButton = document.createElement('button');
                updateButton.textContent = 'Update';
                updateButton.addEventListener('click', () => {
                    // Populate the modal with user data
                    updateName.value = user.name;
                    updateEmail.value = user.email;
                    updateRole.value = user.role;

                    // Show the modal
                    modal.style.display = 'block';
                });
                actionData.appendChild(updateButton);

                // Create delete button for each user
                // Create delete button for each user
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', async () => {
                    // Delete the user from the API
                    const email = user.email;
                    const response = await fetch(`http://127.0.0.1:8000/user/${email}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        // User deleted successfully
                        console.log(`User with email ${email} deleted`);
                        // Remove the user row from the table
                        row.remove();
                        // Show success message
                        alert('User deleted successfully');
                    } else {
                        // Error deleting user
                        console.error('Error deleting user:', response.statusText);
                        // Show error message
                        alert('Failed to delete user');
                    }
                });
                actionData.appendChild(deleteButton);

                row.appendChild(actionData);

                // Append the row to the table
                tbody.appendChild(row);
            });

            // Close the modal when the cancel button is clicked
            // const cancelButton = document.querySelector('#myModal .cancel');
            // cancelButton.addEventListener('click', () => {
            //     modal.style.display = 'none';
            // });

            // Update user data when the update form is submitted
            updateForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                // Get updated user data from form inputs
                const updatedName = updateName.value;
                const updatedEmail = updateEmail.value;
                const updatedRole = updateRole.value;

                // Update user data in the API using PUT request
                const response = await fetch(`http://127.0.0.1:8000/user/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: updatedName,
                        email: updatedEmail,
                        role: updatedRole})
                });

                // Check if API response is successful
                if (response.ok) {
                    // Update the user row in the table
                    const updatedUser = {
                        name: updatedName,
                        email: updatedEmail,
                        role: updatedRole
                    };
                    updateUserRow(updatedUser);

                    // Hide the modal
                    modal.style.display = 'none';

                    // Clear form inputs
                    updateForm.reset();

                    // Show success message
                    alert('User updated successfully');
                } else {
                    // Show error message
                    alert('Failed to update user');
                }
            });
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
});