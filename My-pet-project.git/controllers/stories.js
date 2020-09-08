import extend from '../utils/context.js';
import models from '../models/index.js';
import checkForUser from '../utils/checkForUser.js';
import idGenerator from '../utils/idGenerator.js'

export default {
    get: {
        dashboard(context) {

            checkForUser(context)
            displayUserName(context);

            models.story.getAll().then((response) => {
                //Тази простотия идва от firebase документацията. Първоначално връща един смахнат обект с много пропъртита. Трябва да му дадем "docs", да минем през всеки запис и да му дадем ".data", което реално е нашият обект от firebase. (т.е. response.docs.foreach(x=>x.data))

                //Така се закача id към response...баси
                const allStories = response.docs.map(idGenerator)
                
                for (let i = 0; i < allStories.length; i++) {
                    
                    let imgs = allStories[i].images

                    for (let z = 0; z < imgs.length; z++) {
                        
                        console.log(imgs[z].src);
                    }
                }


              


                context.stories = allStories;
                console.log(context);



                extend(context).then(function () {
                    this.partial('../views/sections/stories.hbs')
                })
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
            const user = firebase.auth().currentUser;

            /*
            * We create new story and save it in the firestore
            * context.params come from the handlebars template (create-story.hbs)
            */
            const data = {
                ...context.params,
                uid: context.userId,
                authorName: user.displayName === null ? "Too shy to share that" : user.displayName,
                likes: 0,
                comments: [],
                images: []
            }

            //Firebase returns the created entity with id so we can use it to track our story.
            models.story.create(data)
                .then(response => {
                    checkForNewlyUplodadeImages(response, user, data)
                    context.redirect('#/home');
                })
                .catch(e => alert(e.message));

        }
    }

}

function checkForNewlyUplodadeImages(response, user, data) {
    let storyId = response.id;

    let imagesRef = document.querySelector('#upload-story-images');
    //Check if there are any images uploaded
    if (imagesRef.files.length > 0) {
        for (var i = 0; i < imagesRef.files.length; i++) {

            var imageFile = imagesRef.files[i];
            uploadImage(imageFile, user, storyId, data)
        }
    }
}
function uploadImage(imageFile, user, storyId, data) {

    let storageDestination = firebase.storage().ref('users/' + user.uid + '/' + storyId + '/' + imageFile.name);
    var task = storageDestination.put(imageFile)
        .then(e => storageDestination.getDownloadURL())
        .then(function (x) {
            data.images.push({ src: x })
            models.story.edit(storyId, data)
        })
        .catch(b => console.log(b));

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