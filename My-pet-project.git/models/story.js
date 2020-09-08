export default {
    create(data) {
        return firebase.firestore().collection('stories').add(data);
    },
    getAll(){
        return firebase.firestore().collection('stories').get();
    },
    // get(id) {
    //     return firebase.firestore().collection('treks').doc(id).get();
    // },
    // close(id){
    //     return firebase.firestore().collection('treks').doc(id).delete();
    // },
    edit(id, data) {
        return firebase.firestore().collection('stories').doc(id).update(data);
    },
    
}