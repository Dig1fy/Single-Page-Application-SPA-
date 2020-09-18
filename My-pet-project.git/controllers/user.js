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
            let isEmailValid = validateParams(email, undefined, undefined, undefined)

            if (isEmailValid) {
                if (!email || !password || !rePassword) {
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
            }
        },

        profile(context) {
            const user = firebase.auth().currentUser;
            const { username, email, phonenumber, age } = context.params;
            const currentUserData = { username, email, phonenumber, age };
            let areParamsValid = validateParams(email, username, phonenumber, age)

            if (areParamsValid) {
                // We also update auth email so we can login with the updated email afterwards
                db.user.setProfileInfo(user.uid, currentUserData);
                user.updateEmail(email).catch(e => { alert(e) })
                    .then(x => {
                        user.updateProfile({
                            displayName: username
                        })
                    })
                    .then(Promise.all([updateProfilePicture()]))
                    .then(setTimeout(function () {
                        context.redirect('#/user/profile');
                    }, 2000))
                    .then(alert('Your profile has been updated successfully!'))
                    .catch(function (error) {
                        alert(error.message);
                    });
            }
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

function validateParams(email, username, phonenumber, age) {
    if (email) {
        let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (!email.match(mailformat)) {
            alert("You have entered an invalid email address!");
            return false;
        }

        if (email.length <= 7 || email.length > 60) {
            alert("Your email should be between 7 and 60 symbols long");
            return false;
        }
    }

    if (username) {
        if (username.length < 2 || username.length > 24) {
            alert("Your username should be between 2 and 24 symbols long");
            return false;
        }

        let forbiddenSymbols = /^(?![._ #($)%^&*""''!@#~`|\\?><,>\/\]\[])(?!.*[._ #($)%^&*""''!@#~`|\\?><,>\/\]\[]$).*/;

        if (!username.match(forbiddenSymbols)) {
            alert("Your username should start/end with letter or digit")
            return false;
        }
    }

    if (phonenumber) {
        let bgPhone = /^((0)|(\+359))([\d]{9})$/;

        if (!phonenumber.match(bgPhone)) {
            alert("Allowed formats of phonenumber: 0XXXXXXXXX , +359XXXXXXXXX");
            return false;
        }
    }

    if (age) {
        if (age > 100) {
            alert("Wooo! You must be ancient or there's a typo in your age")
            return false;
        }

        let digitPattern = /^\d*$/;
        if (!age.match(digitPattern)) {
            alert("Age should consist of digits only")
            return false;
        }
    }

    return true;
}
