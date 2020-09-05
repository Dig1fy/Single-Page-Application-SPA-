export default function checkForUser(context) {
    var user = firebase.auth().currentUser;

    if (user) {
        // let picURL = firebase.storage().ref('users/' + user.uid + '/profileImg').getDownloadURL()
        // User is signed in.    
        // We check for both - null/undefined since both are possible - once when user first login and when 
        // the user uploads profile picture but then clicks "X" and does not change it.     
        context.photoURL = user.photoURL === null || user.photoURL === undefined ? '../images/profile-picture.png' : user.photoURL;
        context.isLoggedIn = true;
        context.userId = user.uid;
        // context.username = user.displayName;
        // localStorage.setItem('userId', user.uid);
        // localStorage.setItem('userEmail', user.email);
    }
    else {
        // User is signed out.
        context.isLoggedIn = false;
        context.userId = null;
        context.username = null;
        context.photoURL = null;
        // localStorage.removeItem('userId');
        // localStorage.removeItem('userEmail');
    }
}