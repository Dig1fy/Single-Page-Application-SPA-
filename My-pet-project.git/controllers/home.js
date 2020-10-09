import extend from '../utils/context.js';
import checkForUser from '../utils/checkForUser.js';
import models from '../models/index.js';
import idGenerator from '../utils/idGenerator.js'

export default {
    get: {
        home(context) {
            checkForUser(context)
            displayUserName(context)

            //We get all stories from the db and sort them by descending (on likes). We render only the top 3 stories.
            models.story.getAll()
                .then((response) => {

                    const allStories = response.docs.map(idGenerator)
                    addStoryMainPicture(allStories)

                    allStories.sort(function (a, b) {
                        if (a.likes < b.likes) { return 1; }
                        else if (a.likes == b.likes) { return 0; }
                        else { return -1; }
                    });

                    context.stories = allStories.slice(0, 3);

                    extend(context).then(function () {
                        this.partial('../views/home/home.hbs');
                    })
                })
        },

        contactUs(context){
            checkForUser(context)
            displayUserName(context)

            extend(context).then(function () {
                this.partial('../views/home/contactUs.hbs');
            })
        },

        aboutUs(context){
            checkForUser(context)
            displayUserName(context)

            extend(context).then(function () {
                this.partial('../views/home/aboutUs.hbs');
            })
        },

        petCare(context){
            checkForUser(context)
            displayUserName(context)

            extend(context).then(function () {
                this.partial('../views/home/petCare.hbs');
            })
        }
    },

    post:{
       contactUs(context){
       
       }
        
    }
}

function displayUserName(context) {
    var user = firebase.auth().currentUser;

    if (user) {
        context.username = user.displayName;
    }
}

//We need to addd mainPicture to each story since our visualization for dashboard, home and each story is different and if we have more than 1 picture for a story, some issues come across.  
function addStoryMainPicture(stories) {
    stories.map(story => {
        if (story.images.length > 0) {
            story.mainPicture = story.images[0];
        }
    });
}