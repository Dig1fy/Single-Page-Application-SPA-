export default {

    //First we need to create the new record in our firebase db. Then it returns a promise which we need to handle and that's where we attach additional user information. It creates 'users' collection automatically.
    register(email, password) {
            
        return firebase.auth().createUserWithEmailAndPassword(email, password)  
    },

    login(email, password) {
        return firebase.auth().signInWithEmailAndPassword(email, password)
    },

    logout() {
        return firebase.auth().signOut()
    },


}