import Models from '../models/index.js';
import extend from '../utils/context.js';
import checkForUser from '../utils/checkForUser.js';
import db from '../utils/firebase-helper.js'

export default {
    get: {
        login(context) {
            // checkForUser(context)
            extend(context)
                .then(function () {
                    this.partial('../views/user/login.hbs');
                });
        },
        register(context) {
            extend(context).then(function () {
                this.partial('../views/user/register.hbs');
            });
        },
        logout(context) {
            Models.user.logout().then(response => {
                checkForUser(context)
                context.redirect('#/home');
            });
        },
        profile(context) {
            let user = firebase.auth().currentUser;

            if (user) {

                db
                    .user
                    .getProfileInfo(user.uid)
                    .then(res => {
                        let data = res.data();
                        Object.keys(data).forEach(key => context[key] = data[key]);
                    }).then(y => {
                        checkForUser(context)
                        extend(context)
                            .then(function () {
                                this.partial('../views/user/profile.hbs');
                            })
                    })
            }
        }
    },
    post: {
        login(context) {
            const { email, password } = context.params;
            Models.user.login(email, password)
                .then(response => {
                    context.user = response;
                    context.redirect('#/home');
                })

                .catch(e => alert(e));
        },
        //sending post request to firebase to register user.
        register(context) {
            // context params come from the register.hbs template input fields with "name"
            const { email, password, rePassword } = context.params;

            //some input validation
            let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            if (!email.match(mailformat)) {
                alert("You have entered an invalid email address!");
            } else if (!email || !password || !rePassword) {
                alert('Please fill in all fields')
            } else if (password === rePassword) {
                //first we register the new user via the firebase.auth();
                Models.user.register(email, password)
                    .then(extend(context))
                    .then(x => {
                        context.redirect('#/user/login')
                    })
                    //then we create new user record in the realtime database 
                    .then(x => {
                        let currUser = firebase.auth().currentUser;
                        let userUid = currUser.uid;
                        let userData = {
                            email: email
                        }

                        db.user.setProfileInfo(userUid, userData)
                    })
                    .catch(e => alert(e));
            } else {
                alert('Confirm password did not match!')
            }
        },

        profile(context) {
            const user = firebase.auth().currentUser;
            const { username, email, phonenumber, age } = context.params;
            const currentUserData = { username, email, phonenumber, age };

            if (age && (age < 16 || age > 100)) {
                alert('Unfortunately, only users between 16 - 100 years of age are allowed to register in our platform')
            } else {

                // We also update auth email so we can login with the updated email afterwards
                db.user.setProfileInfo(user.uid, currentUserData);
                user.updateEmail(email).catch(e => { alert(e) })
                    .then(x => {
                        console.log('1')
                        user.updateProfile({
                            displayName: username
                        })
                    })
                    .then(Promise.all([updateProfilePicture()]))
                    .then(setTimeout(function() {
                        context.redirect('#/user/profile');
                      }, 1500))
                      .then(alert('Your profile has been updated successfully!'))
                    .catch(function (error) {
                        alert(error.message);
                    });

                ///////////////////////////
                function updateProfilePicture() {
                    const inputImg = document.querySelector('#input-image');
                    const user = firebase.auth().currentUser;

                    //We proceed further only if the user has chosen new profile picture. 
                    if (inputImg.files.length > 0 && user.photoURL !== inputImg.files[0]) {

                        /*
                        * Accessing the firebase storage -> users/userId/profileImg, then retrieving the newly 
                        * generated picture URL
                        */
                        const ref = firebase.storage().ref('users/' + user.uid);
                        const file = document.querySelector('#input-image').files[0]
                        const name = 'profileImg';
                        const metadata = {
                            contentType: file.type
                        };
                        const task = ref.child(name).put(file, metadata);
                        task
                            .then(snapshot => snapshot.ref.getDownloadURL())
                            .then((url) => {
                                user.updateProfile({
                                    photoURL: url
                                })
                                // alert('Profile PICTURE updated')
                            })
                            // .then(checkForUser())                        
                            .catch(e => alert(e.message));
                    }
                }
            }
        },
        //We delete all user data - firebase authentication + firebase db + storage with the current user id. 
        delete(context) {
            const user = firebase.auth().currentUser;
            const userId = user.uid;

            user.delete()
                .then(function () {

                    //Firebase does not support storage check for any data and throws an error if you try to delete non-existent data. PERFECT...
                    firebase.storage()
                        .ref('users/' + userId + '/profileImg')
                        .delete()
                        .catch(e => alert('Successfully deleted'))

                    context.redirect('#/home');
                })
                .then(firebase.firestore().collection('users').doc(userId).delete())
                .catch(function (error) {
                    alert(error);
                });
        },
    }
}