export default {
    validateStoryData(data) {
        const title = data.title;
        const images = data.images;
        const email = data.email;
        const phoneNumber = data.phonenumber;
        const description = data.description;

        if (description.length < 60) {
            return 'We believe that a story has to contain at least 60 symbols.'
        }

        if (title.length > 65) {
            return 'Your title cannot exceed 65 symbols!'
        }

        if (images && images.length > 8) {
            return 'You can upload up to 8 pictures/photos!'
        }

        if (email.length > 50) {
            return 'Your email cannot exceed 50 symbols!'
        }

        if (phoneNumber.length > 12) {
            return 'Your phone number is incorrect!'
        }

        return true;
    },

    validateUserData(email, username, phonenumber, age) {
        if (email) {
            let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            if (!email.match(mailformat)) {
                alert("You have entered an invalid email address!");
                return false;
            }

            if (email.length <= 7 || email.length > 60) {
                alert("Your email should be between 7 and 60 symbols long");
                return false;
            }
        }

        if (username) {
            if (username.length < 2 || username.length > 24) {
                alert("Your username should be between 2 and 24 symbols long");
                return false;
            }

            let forbiddenSymbols = /^(?![._ #($)%^&*""''!@#~`|\\?><,>\/\]\[])(?!.*[._ #($)%^&*""''!@#~`|\\?><,>\/\]\[]$).*/;

            if (!username.match(forbiddenSymbols)) {
                alert("Your username should start/end with letter or digit")
                return false;
            }
        }

        if (phonenumber) {
            let bgPhone = /^((0)|(\+359))([\d]{9})$/;

            if (!phonenumber.match(bgPhone)) {
                alert("Allowed formats of phonenumber: 0XXXXXXXXX , +359XXXXXXXXX");
                return false;
            }
        }

        if (age) {
            if (age > 100) {
                alert("Wooo! You must be ancient or there's a typo in your age")
                return false;
            }

            let digitPattern = /^\d*$/;
            if (!age.match(digitPattern)) {
                alert("Age should consist of digits only")
                return false;
            }
        }

        return true;
    }
}