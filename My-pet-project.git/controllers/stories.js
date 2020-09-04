import extend from '../utils/context.js';
import checkForUser from '../utils/checkForUser.js';

export default {
    get: {
        dashboard(context) {
            checkForUser(context)
            extend(context).then(function () {
                this.partial('../views/sections/stories.hbs');
            })
        },
        create(context) {
            checkForUser(context) 
            extend(context).then(function () {
                this.partial('../views/sections/create-story.hbs')
            })
        }
    }
    
}