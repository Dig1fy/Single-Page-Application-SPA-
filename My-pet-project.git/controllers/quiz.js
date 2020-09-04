import extend from '../utils/context.js';
import checkForUser from '../utils/checkForUser.js';

export default {
    get: {
        quiz(context) {
            checkForUser(context)
            extend(context).then(function () {
                this.partial('../views/quiz/quiz.hbs');
            })
        }
    }
}