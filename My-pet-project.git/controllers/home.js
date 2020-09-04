import extend from '../utils/context.js';
import checkForUser from '../utils/checkForUser.js';

export default {
    get: {
        home(context) {
            var user = firebase.auth().currentUser;

            if (user) {
                context.username = user.displayName;
            }

            checkForUser(context)
            extend(context).then(function () {
                this.partial('../views/home/home.hbs');
            })
        }
    }
}