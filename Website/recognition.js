"use strict";

const serverUrl = "http://127.0.0.1:8000";

const signinSessionKey = "user_signed_in";

// add an event listener to the sign-up button
const signoutBtn = document.getElementById('sign-out');
signoutBtn.addEventListener('click', () => {
    signOut();
    window.location.href = 'signin.html';
});

const searchBtn = document.getElementById('card-search');
searchBtn.addEventListener('click', () => {
    window.location.href = 'cards-view.html';
});


const console_adminBtn = document.getElementById('admin-console');
console_adminBtn.addEventListener('click', () => {
    window.location.href = 'console-admin.html';
});

async function uploadImage() {
    // encode input file as base64 string for upload
    let file = document.getElementById("file").files[0];
    let converter = new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result
            .toString().replace(/^data:(.*,)?/, ''));
        reader.onerror = (error) => reject(error);
    });
    let encodedString = await converter;

    // clear file upload input field
    document.getElementById("file").value = "";

    // make server call to upload image
    // and return the server upload promise
    return fetch(serverUrl + "/images", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: file.name, filebytes: encodedString })
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function updateImage(image) {
    //document.getElementById("view").style.display = "block";

    let imageElem = document.getElementById("image");
    imageElem.src = image["fileUrl"];
    imageElem.alt = image["fileId"];
    imageElem.height = 400;

    return image;
}

function recognitionImage(image) {
    // make server call to translate image
    // and return the server upload promise
    return fetch(serverUrl + "/images/" + image["fileId"] + "/recognition", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "id": 1 })
    }).then(response => {
        if (response.ok) {
            return response.json();

        } else {
            throw new HttpError(response);
        }
    })
}

let phoneId = document.getElementById("tp_id");
let nameId = document.getElementById("name_id");
let emailId = document.getElementById("email_id");
let urlId = document.getElementById("website_id");
let addressId = document.getElementById("company_address_id");

function annotateImage(entities) {
    phoneId.innerText = "(click to edit)"
    nameId.innerText = "(click to edit)"
    emailId.innerText = "(click to edit)"
    urlId.innerText = "(click to edit)"
    addressId.innerText = "(click to edit)"
    document.getElementById("form").style.display = "block"
    for (let i = 0; i < entities.length; i++) {
        if (entities[i]["entity"] == "PHONE_OR_FAX") {
            phoneId.innerText = entities[i]["text"];
        } else if (entities[i]["entity"] == "NAME") {
            nameId.innerText = entities[i]["text"];
        } else if (entities[i]["entity"] == "EMAIL") {
            emailId.innerText = entities[i]["text"];
        } else if (entities[i]["entity"] == "URL") {
            urlId.innerText = entities[i]["text"];
        } else if (entities[i]["entity"] == "ADDRESS") {
            addressId.innerText = entities[i]["text"];
        }
    }
}

function uploadAndRecognition() {
    uploadImage()
        .then(image => updateImage(image))
        .then(image => recognitionImage(image))
        .then(entities => {
            annotateImage(entities)
        })
        .catch(error => {
            alert("Error: " + error);
        })
}

class HttpError extends Error {
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = "HttpError";
        this.response = response;
    }
}

function saveJSON() {
    let companyWebsite = document.getElementById("website_id").innerHTML;
    let name = document.getElementById("name_id").innerHTML;
    let phone = document.getElementById("tp_id").innerHTML;
    let email = document.getElementById("email_id").innerHTML;
    let address = document.getElementById("company_address_id").innerHTML;


    let token = localStorage.getItem(signinSessionKey)

    var raw = JSON.stringify({
        "name": name,
        "telephone_number": phone,
        "email": email,
        "company_website": companyWebsite,
        "company_address": address
    });

    var requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + JSON.parse(token).token
        },
        body: raw,
        redirect: 'follow'
    };

    fetch("http://127.0.0.1:8000/cards/create", requestOptions)
        .then(response => response.text())
        .then(result => alert("Card successfully created with id: \n" + result))
        .catch(error => {
            alert("Session expired")
            signOut()
        });
}


function signOut() {
    localStorage.removeItem(signinSessionKey)
    window.location.href = 'signin.html';

}

// check if the user is already signed in
if (localStorage.getItem(signinSessionKey) === null) {
    // redirect the user to the dashboard page
    window.location.href = 'signin.html';
}

window.onload = function () {

    let token = localStorage.getItem(signinSessionKey)
    let user = decodeJwt(token)
    let role = user.role;
    if (role === 'user') {

        var adminConsoleElement = document.getElementById("admin-console");

        adminConsoleElement.style.display = "none";
    }
};

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
