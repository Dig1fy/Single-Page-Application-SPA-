import extend from '../utils/context.js';
import checkForUser from '../utils/checkForUser.js';
import models from '../models/index.js';
import idGenerator from '../utils/idGenerator.js'

export default {
    get: {
        home(context) {
            var user = firebase.auth().currentUser;

            if (user) {
                context.username = user.displayName;
            }

            checkForUser(context)           

            //We get all stories from the db and sort them by descending (on likes). We render only the top 3 stories.
            models.story.getAll()
                .then((response) => {

                    const allStories = response.docs.map(idGenerator)
                    
                    allStories.sort(function (a, b) {
                        if (a.likes < b.likes) { return 1; }
                        else if (a.likes == b.likes) { return 0; }
                        else { return -1; }
                    });
                    
                    context.stories = allStories.slice(0, 3);

                    console.log(context);
                    extend(context).then(function () {
                        this.partial('../views/home/home.hbs');
                    })
                })







        }
    }
}