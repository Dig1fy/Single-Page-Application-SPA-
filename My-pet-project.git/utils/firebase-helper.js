export default {

    user: {

        setProfileInfo(userId, data) {
            
            let userRef = firebase.firestore().collection('users').doc(userId);
            userRef.set(data)
                .catch(err => {
                    console.log('Error getting document', err);
                });
        },

        getProfileInfo(userId) {
            let userRef = firebase.firestore().collection('users').doc(userId);
            return userRef.get()
                .catch(err => {
                    alert('Error getting document', err);
                });
        },
    }
}