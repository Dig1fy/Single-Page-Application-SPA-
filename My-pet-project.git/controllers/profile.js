/*   THIS IS NOT CONNECTED TO THE HTML !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * Preview of the profile picture via the DOM manipulation. 
 */

// let inputImg = document.querySelector('#input-image');
// let preview = document.querySelector('#proff');
// let headerImg = document.querySelector('.profile-image-header')
// //TODO make default view of the profile pic. В момента няма картинка... 

// inputImg.addEventListener('change', x => {

//     if (inputImg.files.length > 0) {
//         let newPictureSrc = URL.createObjectURL(inputImg.files[0]);
//         preview.src = newPictureSrc;

//     } else {
//         preview.src = headerImg.src;
//     }
// })




// // FIREBASE STORAGE  

// accessing the uploaded picture
let user = firebase.auth().currentUser;
let submitBtn = document.querySelector("#root > div > form.user-profile-form > p.submit-btn-wrapper > button")
submitBtn.addEventListener('click', function () {
    if (inputImg.files.length > 0) {

        let userId = user.uid;
        firebase.storage().ref('users/' + userId + '/profileImg').put(inputImg.files[0]).then(x => {
            alert('Profile updated')
        })
    }
})