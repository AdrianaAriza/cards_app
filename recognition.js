"use strict";

const serverUrl = "http://127.0.0.1:8000";

// Variables to store card data
var phoneId;
var nameId;
var emailId;
var addressId;
var companyWebsite;

// Log in and store the token inside local storage
// Need to remove this code block after we have the
//  sign in page ready so we don't perform login twice.
var loginHeader = new Headers();
loginHeader.append("Content-Type", "application/json");

var loginRaw = JSON.stringify({
    "email": "adru@gmail.com",
    "password": "adru123"
});

var loginOptions = {
    method: 'POST',
    headers: loginHeader,
    body: loginRaw,
    redirect: 'follow'
};

fetch("http://127.0.0.1:8000/login", loginOptions)
    .then(response => response.text())
    .then(result => {
        console.log(result);
        localStorage.setItem("token", result); // After logging in, should store the token
        })
    .catch(error => console.log('error', error));

//
//
// REMOVE UP TO HERE ONCE SIGN IN PAGE IS READY

async function uploadImage() {
    // encode input file as base64 string for upload
    let file = document.getElementById("file").files[0];
    let converter = new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result
            .toString().replace(/^data:(.*,)?/, ''));
        reader.onerror = (error) => reject(error);
    });
    let encodedString = await convertSer;

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
        body: JSON.stringify({filename: file.name, filebytes: encodedString})
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function updateImage(image) {
    let imageElem = document.getElementById("image");
    imageElem.src = image["fileUrl"];
    imageElem.alt = image["fileId"];

    return image;
}

function translateImage(image) {
    // make server call to translate image
    // and return the server upload promise
    return fetch(serverUrl + "/images/" + image["fileId"] + "/translate-text", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"id":1})
    }).then(response => {
        if (response.ok) {
            return response.json();

        } else {
            throw new HttpError(response);
        }
    })
}

function annotateImage(entities) {
    document.getElementById("form").style.display="block"

    for (let i=0; i<entities.length; i++) {
        if (entities[i]["entity"] == "PHONE_OR_FAX") {
            phoneId = document.getElementById("tp_id");
            phoneId.innerText = entities[i]["text"];
        } else if (entities[i]["entity"] == "NAME") {
            nameId = document.getElementById("name_id");
            nameId.innerText = entities[i]["text"];
        } else if (entities[i]["entity"] == "EMAIL") {
            emailId = document.getElementById("email_id");
            emailId.innerText = entities[i]["text"];
        } /*else if (entities[i]["entity"] == "URL") {
            const urlId = document.getElementById("website_id");
            urlId.innerText = entities[i]["text"];
        }*/ else if (entities[i]["entity"] == "ADDRESS") {
            addressId = document.getElementById("company_address_id");
            addressId.innerText = entities[i]["text"];
        }
    }

}

function uploadAndTranslate() {
    uploadImage()
        .then(image => updateImage(image))
        .then(image => translateImage(image))
        .then(entities => annotateImage(entities))
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
    let element = document.getElementById("website_id");
    let companyWebsite = element.innerHTML;

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZHJ1QGdtYWlsLmNvbSIsImlhdCI6MTY4MDMzMzk5NSwibmJmIjoxNjgwMzMzOTk1LCJqdGkiOiJkZWI1NGQ4NC01YTg0LTQ5OTgtOWRiYS1hYjgxNTRmM2UxNjUifQ.xzaApU9pu2DshCGApNA8FIjebaE9mEFAipObifYsRA0");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "name": nameId.innerHTML,
        "telephone_number": phoneId.innerHTML,
        "email": emailId.innerHTML,
        "company_website": companyWebsite,
        "company_address": addressId.innerHTML
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("http://127.0.0.1:8000/cards/create", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

function signOut() {
    localStorage.clear();
}

