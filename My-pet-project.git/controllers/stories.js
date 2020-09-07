import extend from '../utils/context.js';
import models from '../models/index.js';
import checkForUser from '../utils/checkForUser.js';

export default {
    get: {
        dashboard(context) {

            checkForUser(context)
            displayUserName(context);
            extend(context).then(function () {
                this.partial('../views/sections/stories.hbs');
            })
        },
        create(context) {
            checkForUser(context)
            displayUserName(context);
            extend(context).then(function () {
                this.partial('../views/sections/create-story.hbs')
                    .then(listenForUploadedPictures)
            })
        }
    },
    post: {
        create(context) {
            checkForUser(context)
            // displayUserName(context);
            // extend(context)
            const user = firebase.auth().currentUser;

            // // These params come from the create-story.hbs template (name). Their name should be the same here, otherwise Sammy throws an exception
            let imagesRef = document.querySelector('#upload-story-images');
            const { title, description, email, phonenumber, storyImages } = context.params;
            // const storageDestination = firebase.storage().ref('users/' + user.uid + '/' + title);

            //Check if there are any images uploaded
            if (imagesRef.files.length > 0) {
                for (var i = 0; i < imagesRef.files.length; i++) {
                    var imageFile = imagesRef.files[i];
                    uploadImageAsPromise(imageFile, context, user).then((res) => {
                        console.log(res);
                    });
                }
            }

            console.log(user);
            //We create new story and save it in the firestore
            const data = {
                ...context.params,
                uid: context.userId,
                authorName: user.displayName === null ? "Too shy to share that" : user.displayName,
                likes: 0,
                comments: []
            }
            
            models.story.create(data)
                .then(response => {
                    context.redirect('#/home');
                })
                .catch(e => alert(e.message));

        }
    }

}

async function uploadImageAsPromise(imageFile, context, user) {
    return new Promise(function (resolve, reject) {


        // These params come from the create-story.hbs template (name). Their name should be the same here, otherwise Sammy throws an exception

        const { title, description, email, phonenumber, storyImages } = context.params;

        let storageDestination = firebase.storage().ref('users/' + user.uid + '/' + title + '/' + imageFile.name);

        var task = storageDestination.put(imageFile);
        console.log(task);
        //Update progress bar
        //TODO - render the progress
        task.on('state_changed',
            function progress(snapshot) {
                var percentage = snapshot.bytesTransferred / snapshot.totalBytes *
                    100;
            },
            function error(err) {
                console.log(err);
                reject(err);
            },
            function complete() {
                var downloadURL = task.snapshot.downloadURL;
                resolve(downloadURL);
            }
        );
    });
}

function displayUserName(context) {
    var user = firebase.auth().currentUser;

    if (user) {
        context.username = user.displayName;
    }
}

function listenForUploadedPictures() {
    const fileUpload = document.getElementById("upload-story-images");

    fileUpload.onchange = function () {
        if (typeof (FileReader) !== "undefined") {
            const dvPreview = document.getElementById("preview-story-images");
            dvPreview.innerHTML = "";
            const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.gif|.png|.bmp)$/;

            for (var i = 0; i < fileUpload.files.length; i++) {
                let file = fileUpload.files[i];
                if (regex.test(file.name.toLowerCase())) {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        let img = document.createElement("img");
                        img.classList.add('class', 'story-image')
                        img.src = e.target.result;
                        dvPreview.appendChild(img);
                    }
                    reader.readAsDataURL(file);
                } else {
                    alert(file.name + " is not a valid image file or it's name contains letters which are not latin.");
                    dvPreview.innerHTML = "";
                    return false;
                }
            }
        } else {
            alert("This browser does not support HTML5 FileReader.");
        }
    }
}