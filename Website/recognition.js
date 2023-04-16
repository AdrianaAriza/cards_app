"use strict";

const serverUrl = "http://127.0.0.1:8000";

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
    //document.getElementById("view").style.display = "block";

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
    let entitiesElem = document.getElementById("entities");
    while (entitiesElem.firstChild) {
        entitiesElem.removeChild(entitiesElem.firstChild);
    }
    entitiesElem.clear
    //entities = JSON.stringify(entities)
    for (let i = 0; i < entities.length; i++) {
        let entitiyElem = document.createElement("h6");
        entitiyElem.appendChild(document.createTextNode(
            //entities
            entities[i]["text"] + " -> " + entities[i]["entity"]
        ));
        entitiesElem.appendChild(document.createElement("hr"));
        entitiesElem.appendChild(entitiyElem);
    }
    return entities
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
