import controllers from '../controllers/index.js'

    var app = Sammy('#root', function () {

        this.use('Handlebars', 'hbs');
    
         //Home
        this.get('#/home', controllers.home.get.home)
    
        //User
        this.get('#/user/login', controllers.user.get.login)
        this.get('#/user/register', controllers.user.get.register)    
        this.post('#/user/login', controllers.user.post.login)
        this.post('#/user/register', controllers.user.post.register)    
        this.get('#/user/logout', controllers.user.get.logout)
        this.get('#/user/profile', controllers.user.get.profile)
        this.post('#/user/profile', controllers.user.post.profile)
        this.post('#/user/profile/delete', controllers.user.post.delete)
        // this.post('#/user/profile/updateImage', controllers.user.get.updateImage)
        // this.post('#/user/profile/updateImage', controllers.user.post.updateImage)
        
        //Quiz
        this.get('#/quiz', controllers.quiz.get.quiz)
        // this.get('#/quiz', controllers.quiz.post.quiz)
        
        //Story
        this.get('#/sections/stories', controllers.stories.get.dashboard)
        this.get('#/sections/stories/create', controllers.stories.get.create)
        this.post('#/sections/stories/create', controllers.stories.post.create)
        //The storyId should be named the same way as in the handlebars template. Then in controllers, it comes as context param. 
        this.get('#/story/details/:storyId', controllers.stories.get.details)

        

    })
    
    
    $(()=>{
        app.run('#/home');
    })

