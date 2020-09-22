import extend from '../utils/context.js';
import models from '../models/index.js';
import checkForUser from '../utils/checkForUser.js';
import docModifier from '../utils/idGenerator.js';
import validations from '../utils/validations.js'

export default {
    get: {
        dashboard(context) {

            checkForUser(context)
            displayUserName(context);

            models.story.getAll().then((response) => {
                //Тази простотия идва от firebase документацията. Първоначално връща един смахнат обект с много пропъртита. Трябва да му дадем "docs", да минем през всеки запис и да му дадем ".data", което реално е нашият обект от firebase. (т.е. response.docs.foreach(x=>x.data))

                //This is where we attach id to to each story (the id itself comes from Firebase)
                const allStories = response.docs.map(docModifier)

                context.stories = allStories;
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
        },

        details(context) {
            checkForUser(context)
            displayUserName(context);

            const { storyId } = context.params;

            models.story.get(storyId)
                .then(response => {
                    //Attach the id to the story and returns the entire entity with all story details. 
                    const story = docModifier(response);

                    //To make it easier when using the templates (hbs), we attach the story details to the context. So when we use the templates, we access each element directly (instead of context.description, context.username, context.email etc., we go for description, username, email)
                    Object.keys(story).forEach(key => {
                        context[key] = story[key]
                    })

                    //We check if the current user is the author of the story.
                    context.isAuthor = story.uid === context.userId;

                    context.comments = story.comments;

                    extend(context)
                        .then(function () {
                            this.partial('../views/sections/details.hbs')
                                .then(x => showAllStoryComments())
                        })
                })
        },
        edit(context) {
            checkForUser(context)
            displayUserName(context);
            const { storyId } = context.params;
            context.idFromFirebase = storyId;

            models.story.get(storyId).then(response => {
                const storyInfo = docModifier(response);

                Object.keys(storyInfo).forEach(key => {
                    context[key] = storyInfo[key]
                })
            })
                .then(() => {
                    extend(context).then(function () {
                        this.partial('../views/sections/edit-story.hbs')
                            .then(x => listenForUploadedPictures());
                    })
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
                authorName: user.displayName === null ? "Anonymous" : user.displayName,
                peopleWhoHaveLiked: [],
                likes: 0,
                mainPicture: {},
                comments: [],
                images: []
            }

            let result = validations.validateStoryData(data)
            if (result !== true) {
                alert(result);
                return;
            }
            //Firebase returns the created entity with id so we can use it to track our story.
            models.story.create(data)
                .then(response => {
                    checkForNewlyUplodadeImages(response, user, data)
                    setTimeout(function () {
                        context.redirect('#/sections/stories')
                    }, 500)
                })
                .catch(e => alert(e.message));

        },

        likes(context) {
            //We attached the storyId in the template so we can retrieve it as context param
            const { storyId } = context.params;

            models.story.get(storyId)
                .then(response => {
                    const story = docModifier(response) //понеже ни връща шантав обект (response), го минаваме през modifier, за да стане js

                    //Check if the current user has already liked the story. If yes, he cannot like it again, otherwise, add him in the list of people who have liked the story and adjust the like's count
                    let currentPersonId = firebase.auth().currentUser.uid;

                    //If someone has already liked a story, we note that to the context and the take control over the rendering in the handlebar templates.
                    if (story.peopleWhoHaveLiked.some(x => x === currentPersonId)) {
                        context.hasLiked = true;

                    } else {
                        story.likes += 1;
                        story.peopleWhoHaveLiked.push(currentPersonId)

                        let likes = document.querySelector("#details-likes");
                        likes.textContent++;
                        return models.story.edit(storyId, story);
                    }
                })
        },

        comments(context) {
            //TODO
            // IMPLEMENT THE LOGIC - add comments/replies
            checkForUser(context);
            const { comment, storyId } = context.params;

            if (comment.length > 0) {
                models.story.get(storyId)
                    .then(response => {
                        const story = docModifier(response)
                        let currentUserName = context.currentUserName === null || context.currentUserName === undefined ? 'Anonymous' : context.currentUserName;
                        let currentUserPicture = context.photoURL === null || context.photoURL === undefined ? '../images/profile-picture.png' : context.photoURL
                        let currentDate = getCurrentDateTime()

                        let newComment = {
                            user: currentUserName,
                            photoURL: currentUserPicture,
                            dateTime: currentDate,
                            comment: comment
                        }

                        story.comments.push(newComment)
                        context.comments = story.comments;

                        renderCommentsOnClientSide(currentUserName, currentUserPicture, currentDate, comment)
                        return models.story.edit(storyId, story);
                    })
            } else {
                alert('Empty comments are not allowed')
            }
        }
    },
    del: {
        delete(context) {
            const { storyId } = context.params;

            /*
            * NOTE: In cloud firestore, we keep only URLs to each story picture. The pictures themselves are being stored in the firebase storage;
            * First we need to manually delete each picture from the firebase storage (we need to access the images url, therefore the story delete comes after this one). Firebase does not have a concept for deleting entire folder recursively
            */
            models.story.get(storyId)
                .then(response => {
                    let story = docModifier(response);
                    console.log(story);
                    let oldImages = story.images;
                    let desertRef = firebase.storage()

                    for (let i = 0; i < oldImages.length; i++) {
                        let imageUrl = oldImages[i].src
                        desertRef.refFromURL(imageUrl).delete()
                    }
                })
                /*
                * After deleting the images from the storage, we can proceed with deleting the story itself.
                */
                .then(response => {
                    models.story.delete(storyId)
                        .then(r => {
                            context.redirect('#/sections/stories')
                        })
                        .catch(e => { alert(e.message) })
                })
        }
    },
    put: {
        edit(context) {
            const { storyId } = context.params;
            const user = firebase.auth().currentUser;

            models.story.get(storyId)
                .then(response => {
                    const story = docModifier(response);
                    let oldImages = story.images;

                    let storyData = { ...context.params }

                    //The story authorName will be automatically changed according to the user profile (name) 
                    storyData.authorName = user.displayName;
                    
                    let uploadedPhotos = document.querySelector('#upload-story-images');
                    let picturesCount = uploadedPhotos.files.length;

                    //Check if the user has uploaded new files when editing the story. If yes, delete the old ones from the firebase storage and upload the new ones. Unfortunately, firebase API does not provide easier way for listing all files and manipulate them. The only way is if we knew the photos names, which means refactoring a lof of logic. 
                    if (picturesCount > 0) {
                        storyData = { ...context.params, images: [] }

                        //Delete the old pictures via the clod firestore picture URLs
                        let desertRef = firebase.storage()

                        for (let i = 0; i < oldImages.length; i++) {
                            let imageUrl = oldImages[i].src
                            desertRef.refFromURL(imageUrl).delete()
                        }

                        for (var i = 0; i < picturesCount; i++) {

                            var imageFile = uploadedPhotos.files[i];
                            uploadImage(imageFile, user, storyId, storyData)
                        }
                    }

                    let isDataValid = validations.validateStoryData(storyData)
                    if (isDataValid !== true) {
                        alert(isDataValid);
                        return;
                    }

                    models.story.edit(storyId, storyData)
                        .then(
                            setTimeout(function () {
                                context.redirect(`#/story/details/${storyId}`)
                            }, 1500))


                        .catch(e => alert(e.message));
                })
        }
    }
}

//Adding the new comment dynamically using the DOM manipulation
function renderCommentsOnClientSide(currentUserName, currentUserPicture, currentDate, comment) {

    if (comment.length > 0) {
        let parentEl = document.querySelector('#comments-pic-info');
        let inputTextRef = document.querySelector("#story-comment");

        let sss = `<div class="entire-comment-wrapper">
        <div class="comment-info">
          <div class="comment-photo">
            <img class="comment-photo" src="${currentUserPicture}" alt="">
          </div>
          <div class="story-comment-userInfo-wrapper">
            <div class="story-comment-userInfo">${currentUserName}:</div>
            <div class="story-comment-wrapper">
              <label class="story-comment-content">${comment}</label>
            </div>
            <div class="story-comment-datetime">${currentDate}</div>
          </div>
          <br>
        </div>
      </div>`

        parentEl.innerHTML += sss;
        inputTextRef.value = "";
    }
}

function getCurrentDateTime() {
    let now = new Date();

    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();

    let currentDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    return currentDate;
}

function showAllStoryComments(e) {

    /* 
    * If we leave the first comment it will show "there are no comments yet". This is due to the implementec logic in details.hbs (handlebars), which checks if   * there are any comments when rendering. Since we are adding the first comment on the serverside (with this function) but not on the server side, we need to  * explicitly check this case. 
    */
    let noCommentsText = document.querySelector('#comments-pic-info').children[1];
    if (noCommentsText.className === 'text-center') {
        noCommentsText.textContent = "";
    }


    const showBtnRef = document.querySelector('#show-hide-comments-btn');
    const allCommentsRef = document.querySelector('#comment-show-hide');

    showBtnRef.addEventListener('click', function (e) {
        allCommentsRef.style.display = allCommentsRef.style.display === 'block' ? 'none' : 'block';
    })
}

function checkForNewlyUplodadeImages(response, user, data) {
    let storyId = response.id;
    let imagesRef = document.querySelector('#upload-story-images');
    console.log(imagesRef.children);
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
            const regex = /(.jpg|.jpeg|.gif|.png|.bmp)$/;
            //  /^([a-zA-Z0-9\s_\\.()\-:])+
            //  (.jpg|.jpeg|.gif|.png|.bmp)$/;

            if (fileUpload.files.length > 8) {
                alert('You can upload up to 8 pictures/photos!')
                return;
            }

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

// function storyValidation(data) {
//     const title = data.title;
//     const images = data.images;
//     const email = data.email;
//     const phoneNumber = data.phonenumber;
//     const description = data.description;

//     if (description.length === 0) {
//         return 'Your story description cannot be empty!'
//     }

//     if (title.length > 65) {
//         return 'Your title cannot exceed 65 symbols!'
//     }

//     if (images.length > 8) {
//         return 'You can upload up to 8 pictures/photos!'
//     }

//     if (email.length > 100) {
//         return 'Your email cannot exceed 100 symbols!'
//     }

//     if (phoneNumber.length > 20) {
//         return 'Your phone number is incorrect!'
//     }

//     return true;
// }