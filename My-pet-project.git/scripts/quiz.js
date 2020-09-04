(function run() {

    // select all elements
    const html = {
        startCountRef: document.querySelector('.start-quiz'),
        quiz: document.querySelector("#quiz"),
        question: document.querySelector("#question"),
        qImg: document.querySelector("#qImg"),
        choiceA: document.querySelector("#A"),
        choiceB: document.querySelector("#B"),
        choiceC: document.querySelector("#C"),
        choiceD: document.querySelector("#D"),
        choiceContainer: document.querySelector('#choice-container'),
        progress: document.querySelector("#progress"),
        exitBtn: document.querySelector('.exit-quiz-wrapper'),
        backBtn: document.querySelector("#container > div.backward-btn-wrapper"),
        progress: document.querySelector("#progress"),
        progressLoaderRef: document.querySelector('.progress-load')
    }

    let questions = [
        {
            question: "What gets you the most excited?",
            answerA: "Experimenting, discovering, and learning",
            answerB: "Helping others",
            answerC: "Music, movies, games, and making others laugh",
            answerD: "Taking risks",
            imgSrc: "../images/quiz/1.png",
        },
        {
            question: "What is your ideal work environment?",
            answerA: "Inside a high tech lab with lots of fancy equipment",
            answerB: "Somewhere I feel appreciated for my work",
            answerC: "Surrounded by cool gadgets and toys",
            answerD: "Inside a cozy room or garage at home",
            imgSrc: "../images/quiz/2.png"
        },
        {
            question: "Who are your role models?",
            answerA: "People who make great discoveries",
            answerB: "People who make sacrifices to help others",
            answerC: "Creative, artistic, and expressive people",
            answerD: "People who build innovative products",
            imgSrc: "../images/quiz/3.png"
        },
        {
            question: "What do you do when you encounter a difficult problem?",
            answerA: "Try to find the solution yourself (online, in a book, etc.)",
            answerB: "Ask someone for help",
            answerC: "Take a break, because it helps you be more creative",
            answerD: "Jump in and try different solutions until one works",
            imgSrc: "../images/quiz/4.png"

        }
    ]

    const lastQuestion = questions.length - 1;
    let runningQuestion = 0;

    //start counter
    (function () {
        let progressCount = 5;

        var timeleft = 5;
        var downloadTimer = setInterval(function () {
            progressCount += 25;
            timeleft--;
            html.progressLoaderRef.style.width = progressCount + "%"
            document.getElementById("countdowntimer").textContent = timeleft;
            if (timeleft <= 0) {
                clearInterval(downloadTimer);
                html.startCountRef.style.display = "none";
                html.quiz.style.display = "block";
                html.backBtn.style.display = "block";
                document.querySelector('.quiz-intro').style.display = "none";
                document.querySelector('.progress-load-wrapper').style.display = "none";
            }

        }, 1000);
    })()

    //render a question
    function renderQuestion() {

        if (runningQuestion <= lastQuestion) {
            let currentQuestion = questions[runningQuestion]
            html.question.innerHTML = `<p> ${currentQuestion.question} </p>`;
            html.qImg.innerHTML = `<img src="${currentQuestion.imgSrc}">`;
            html.choiceA.textContent = currentQuestion.answerA;
            html.choiceB.textContent = currentQuestion.answerB;
            html.choiceC.textContent = currentQuestion.answerC;
            html.choiceD.textContent = currentQuestion.answerD;

        } else { //showing the backward btn and hides the quizz after the last question
            html.backBtn.style.display = "none";
            html.quiz.innerHTML = `<h1 class="end-quiz"> Thank you for participating! </h1>`;
            setTimeout(redirect, 2000)
        }
    }

    // render progress
    (function () {
        for (let qIndex = 0; qIndex <= lastQuestion; qIndex++) {
            html.progress.innerHTML += "<div class='prog' id=" + qIndex + "></div>";
        }
    })()

    //opening the next question (the listener is on the entire div container)
    html.choiceContainer.addEventListener('click', choiceHandler);
    function choiceHandler(e) {
        document.getElementById(runningQuestion).style.backgroundColor = "#0f0";
        runningQuestion++;
        renderQuestion();
    }

    function redirect() {
        window.location.replace("#/home");
    }

    html.exitBtn.addEventListener('click', redirect);
    renderQuestion()

    html.backBtn.addEventListener('click', openPreviousQuestion);

    //set the correct previous question with ternary operator
    function openPreviousQuestion() {
        runningQuestion = runningQuestion > 0 ? runningQuestion - 1 : 0
        // document.getElementById(runningQuestion).style.backgroundColor = "rgb(240, 237, 237)";
        document.getElementById(runningQuestion).style.backgroundColor = "white";
        renderQuestion();
    }


})()