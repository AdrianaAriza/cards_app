const signinSessionKey = "user_signed_in";
let card_cid;
let cards_to_print;
let searchStr = "";

function signOut() {
  localStorage.removeItem(signinSessionKey)
  window.location.href = 'signin.html';

}
const signoutBtn = document.getElementById('sign-out');
signoutBtn.addEventListener('click', signOut);

const homeBtn = document.getElementById('home');
homeBtn.addEventListener('click', () => {
  window.location.href = 'recognition.html';
});


const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
searchBtn.addEventListener('click', () => {
  window.location.href = 'cards-view.html?search=' + searchInput.value;
});


const clearBtn = document.getElementById('clear-btn');
clearBtn.addEventListener('click', () => {
  window.location.href = 'cards-view.html';
});

const downloadBtn = document.getElementById('download-btn');
clearBtn.addEventListener('click', () => {
  window.location.href = 'cards-view.html';
});

function decodeJwt(jwt) {

  var parts = jwt.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: Expected three parts separated by dots.");
  }
  var payloadBase64 = parts[1];
  var payload = atob(payloadBase64);
  var payloadJson = JSON.parse(payload);
  return payloadJson;
}



document.addEventListener('DOMContentLoaded', () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.has('search')) searchStr = urlParams.get('search')
  console.log(queryString);
  console.log(searchStr);
  searchInput.value = searchStr;

  const tbody = document.querySelector('tbody');
  const modal = document.getElementById('cardModal');
  const updateForm = document.getElementById('updateForm');
  const updateName = document.getElementById('updateName');
  const updateEmail = document.getElementById('updateEmail');
  const updateRole = document.getElementById('updateRole');

  let token = localStorage.getItem(signinSessionKey)
  let account = decodeJwt(token)
  console.log(account)

  const consoleBtn = document.getElementById('admin-console');
  if (account.role === 'admin') {
	consoleBtn.addEventListener('click', () => {
	  window.location.href = 'console-admin.html';
	});
  }else{
	consoleBtn.style.display = "none";
	document.getElementById("admin-btn").disabled = true;
  }



  // Fetch card data from API
  fetch('http://127.0.0.1:8000/cards/all', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + JSON.parse(token).token
    }
  })
    .then(response => response.json())
    .then(cards => {
      cards_to_print = cards
      // Loop through each card and create a row in the table
      cards.forEach(card => {
        if (searchStr != "") {
          testStr = ""
          testStr = testStr.concat(card.name).concat("|")
          testStr = testStr.concat(card.email).concat("|")
          testStr = testStr.concat(card.telephone_number).concat("|")
          testStr = testStr.concat(card.company_website).concat("|")
          testStr = testStr.concat(card.company_address).concat("|")

          if (!testStr.match(searchStr)) return;

        }



        const row = document.createElement('tr');
        row.setAttribute('card-id', card.card_id);

        const nameData = document.createElement('td');
        nameData.textContent = card.name;
        nameData.classList.add('name');
        row.appendChild(nameData);

        const emailData = document.createElement('td');
        emailData.textContent = card.email;
        emailData.classList.add('email');
        row.appendChild(emailData);

        const phoneData = document.createElement('td');
        phoneData.textContent = card.telephone_number;
        phoneData.classList.add('phone');
        row.appendChild(phoneData);

		const fqdnData = document.createElement('td');
		fqdnData.textContent = card.company_website + " ";
		fqdnData.classList.add('fqdn');
		
		const fqdnDataBtn = document.createElement("BUTTON");
		fqdnDataBtn.insertAdjacentHTML("beforeend", searchSvg);
		fqdnData.addEventListener('click', () => {
			window.location.href = 'cards-view.html?search=' + card.company_website;
		});
		
		fqdnData.appendChild(fqdnDataBtn)
		row.appendChild(fqdnData);
		

        const addrData = document.createElement('td');
        addrData.textContent = card.company_address;
        addrData.classList.add('addr');
        row.appendChild(addrData);

        const actionData = document.createElement('td');

        //if (account.sub == card.email_owner || account.role == "admin") {
        if (account.sub == card.email_owner || account.role == "admin") {

          // Create update button for each card
          const updateButton = document.createElement('button');
          updateButton.textContent = 'Update';
          updateButton.addEventListener('click', () => {
            // Populate the modal with card data
            card_cid = card.card_id;
            updateName.value = card.name;
            updateEmail.value = card.email;
            updatePhone.value = card.telephone_number;
            updateFQDN.value = card.company_website;
            updateAddr.value = card.company_address;

            // Show the modal
            modal.style.display = 'block';
          });
          actionData.appendChild(updateButton);

          // Create delete button for each card
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', async () => {
            // Delete the card from the API
            const card_cid = card.card_id;
            const response = await fetch(`http://127.0.0.1:8000/cards/${card_cid}`, {
              method: 'DELETE',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + JSON.parse(token).token
              }
            });

            if (response.ok) {
              // card deleted successfully
              console.log(`card ${card_cid} deleted`);
              // Remove the card row from the table
              row.remove();
              // Show success message
              alert('card deleted successfully');
            } else {
              // Error deleting card
              console.error('Error deleting card:', response.statusText);
              // Show error message
              alert('Failed to delete card');
            }
          });
          actionData.appendChild(deleteButton);
        } else {
          actionData.textContent = "(Unauthorized)";
        }

        row.appendChild(actionData);

        // Append the row to the table
        tbody.appendChild(row);
      });

      // Close the modal when the cancel button is clicked
      const cancelButton = document.querySelector('#cardModal .cancel');
      cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
      });


      // Update card data when the update form is submitted
      updateForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get updated card data from form inputs
        const updatedCard = {
          name: updateName.value,
          email: updateEmail.value,
          telephone_number: updatePhone.value,
          company_website: updateFQDN.value,
          company_address: updateAddr.value,
        };


        // Update card data in the API using PUT request
        const response = await fetch(`http://127.0.0.1:8000/cards/${card_cid}`, {
          method: 'PUT',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + JSON.parse(token).token
          },
          body: JSON.stringify(updatedCard)
        });

        // Check if API response is successful
        if (response.ok) {
          // Update the card row in the table
          updateCardRow(updatedCard);
          modal.style.display = 'none';
          updateForm.reset();

        } else {
          // Show error message
          alert('Failed to update card');
        }
      });

      // Function to update a card row in the table
      const updateCardRow = (card) => {
        const row = tbody.querySelector(`tr[card-id="${card_cid}"]`);

        if (row) {
          // Update the row data
          row.querySelector('.name').textContent = card.name;
          row.querySelector('.email').textContent = card.email;
          row.querySelector('.phone').textContent = card.telephone_number + " ";
          row.querySelector('.fqdn').textContent = card.company_website;
          row.querySelector('.addr').textContent = card.company_address;
		
		  fqdnData = row.querySelector('.fqdn');
		  const fqdnDataBtn = document.createElement("BUTTON");
		  fqdnDataBtn.insertAdjacentHTML("beforeend", searchSvg);
	      fqdnData.addEventListener('click', () => {
			window.location.href = 'cards-view.html?search=' + card.company_website;
		  });
		  fqdnData.appendChild(fqdnDataBtn)
		  
        };
        updateCardInFetchResponse(card)
      };

      function updateCardInFetchResponse(card) {
        let foundCard = null;
        console.log(`to update card ${card_cid}`);
        for (let i = 0; i < cards.length; i++) {
          if (cards[i].card_id == card_cid) {
            cards[i] = card;
            console.log(`cards i ${cards[i]} updated`);
          }
        }

      }

    }) // cards => 
    .catch(error => {
      console.error('Error fetching card data:', error);
      alert('Session Expired');
      signOut()
    });
});


function downloadCSV() {

  let csv = '';
  csv += 'Name,	Email,	Telephone,	Company website, Company address \n'
  cards_to_print.forEach((row) => {
	card = row;
	if (searchStr != "") {
          testStr = ""
          testStr = testStr.concat(card.name).concat("|")
          testStr = testStr.concat(card.email).concat("|")
          testStr = testStr.concat(card.telephone_number).concat("|")
          testStr = testStr.concat(card.company_website).concat("|")
          testStr = testStr.concat(card.company_address).concat("|")

          if (!testStr.match(searchStr)) return;

    }

    csv += row['name'] + ',' + row['email'] + ',' + row['telephone_number'] + ',' + row['company_website'] + ',"' + row['company_address'] + '"\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'data.csv';

  link.click();
}


const searchSvg = `<svg fill="#21a2f2" height="16px" width="16px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 502.173 502.173" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M494.336,443.646L316.402,265.713c20.399-31.421,30.023-68.955,27.189-106.632 C340.507,118.096,322.783,79.5,293.684,50.4C261.167,17.884,217.984,0,172.023,0c-0.222,0-0.445,0.001-0.668,0.001 C125.149,0.176,81.837,18.409,49.398,51.342c-66.308,67.316-65.691,176.257,1.375,242.85 c29.112,28.907,67.655,46.482,108.528,49.489c37.579,2.762,75.008-6.867,106.343-27.21l177.933,177.932 c5.18,5.18,11.984,7.77,18.788,7.77s13.608-2.59,18.789-7.769l13.182-13.182C504.695,470.862,504.695,454.006,494.336,443.646z M480.193,467.079l-13.182,13.182c-2.563,2.563-6.73,2.561-9.292,0L273.914,296.456c-1.936-1.937-4.497-2.929-7.074-2.929 c-2.044,0-4.098,0.624-5.858,1.898c-60.538,43.788-143.018,37.3-196.118-15.425C5.592,221.146,5.046,124.867,63.646,65.377 c28.67-29.107,66.949-45.222,107.784-45.376c0.199,0,0.392-0.001,0.591-0.001c40.617,0,78.785,15.807,107.52,44.542 c53.108,53.108,59.759,135.751,15.814,196.509c-2.878,3.979-2.441,9.459,1.032,12.932l183.806,183.805 C482.755,460.35,482.755,464.517,480.193,467.079z"></path> <path d="M259.633,84.449c-48.317-48.316-126.935-48.316-175.253,0c-23.406,23.406-36.296,54.526-36.296,87.627 c0,33.102,12.89,64.221,36.296,87.627S138.906,296,172.007,296c33.102,0,64.222-12.891,87.627-36.297 C307.951,211.386,307.951,132.767,259.633,84.449z M245.492,245.561C225.863,265.189,199.766,276,172.007,276 c-27.758,0-53.856-10.811-73.484-30.44c-19.628-19.628-30.438-45.726-30.438-73.484s10.809-53.855,30.438-73.484 c20.262-20.263,46.868-30.39,73.484-30.39c26.61,0,53.227,10.133,73.484,30.39C286.011,139.112,286.011,205.042,245.492,245.561z "></path> <path d="M111.017,153.935c1.569-5.296-1.452-10.861-6.747-12.43c-5.294-1.569-10.86,1.451-12.429,6.746 c-8.73,29.459-0.668,61.244,21.04,82.952c1.952,1.952,4.512,2.929,7.071,2.929s5.118-0.977,7.071-2.928 c3.905-3.906,3.905-10.238,0-14.143C110.506,200.544,104.372,176.355,111.017,153.935z"></path> <path d="M141.469,94.214c-10.748,4.211-20.367,10.514-28.588,18.735c-3.905,3.906-3.905,10.238,0,14.143 c1.952,1.952,4.512,2.929,7.071,2.929s5.118-0.977,7.07-2.929c6.26-6.26,13.575-11.057,21.741-14.255 c5.143-2.015,7.678-7.816,5.664-12.959C152.413,94.735,146.611,92.202,141.469,94.214z"></path> </g> </g> </g> </g></svg>`;
