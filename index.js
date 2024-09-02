document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById("input");
    const submitButton = document.getElementById("submit-button");

    // Handle Enter key press
    inputField.addEventListener("keydown", (e) => {
        if (e.code === "Enter") {
            e.preventDefault();  // Prevents form submission or other default actions
            handleSubmit();
        }
    });

    // Handle button click
    submitButton.addEventListener("click", handleSubmit);

    // Adding event listener for the date input
    const dateInputField = document.getElementById("date-input");
    dateInputField.addEventListener("change", () => {
        let date = dateInputField.value;
        handleInput(date);
    });

    displayMessage("Please select your preferred language:", "bot");
    displayMessage('<button onclick="selectLanguage(\'en\')">English</button> <button onclick="selectLanguage(\'hi\')">हिंदी</button> <button onclick="selectLanguage(\'te\')">తెలుగు</button>', "bot");
});

function handleSubmit() {
    const inputField = document.getElementById("input");
    const input = inputField.value.trim();
    if (input) {
        inputField.value = "";
        handleInput(input);
    }
}


// document.addEventListener("DOMContentLoaded", () => {
//     const inputField = document.getElementById("input");
//     inputField.addEventListener("keydown", (e) => {
//         if (e.code === "Enter") {
//             e.preventDefault();
//             handleSubmit();
//         }
//     });

//     // Adding an event listener for the date input
//     const dateInputField = document.getElementById("date-input");
//     dateInputField.addEventListener("change", () => {
//         let date = dateInputField.value;
//         handleInput(date);
//     });

//     displayMessage("Please select your preferred language:", "bot");
//     displayMessage('<button onclick="selectLanguage(\'en\')">English</button> <button onclick="selectLanguage(\'hi\')">हिंदी</button> <button onclick="selectLanguage(\'te\')">తెలుగు</button>', "bot");
// });

let userData = {
    name: "",
    phone: "",
    email: "",
    numberOfTickets: 0,
    date: "",
    ticketIDs: [],
    paymentMethod: "",
    cancelName: "",
    selectedMuseum: ""
};

let currentFlow = [];
let currentStep = 0;
let currentLanguage = 'en';

window.selectLanguage = function (language) {
    currentLanguage = language;
    displayMuseums();
}

function displayMuseums() {
    displayMessage("Please select a museum to visit:", "bot");
    displayMessage('<button onclick="selectMuseum(\'Salarjung\')">Salarjung Museum</button> <button onclick="selectMuseum(\'BirlaScience\')">Birla Science Museum</button> <button onclick="selectMuseum(\'Nizam\')">Nizam Museum</button>', "bot");
}

window.selectMuseum = function (museum) {
    userData.selectedMuseum = museum;
    startConversation();
}

function startConversation() {
    displayMessage(languages[currentLanguage].welcome, "bot");
    displayMessage(languages[currentLanguage].help, "bot");
    displayMessage(`<button onclick="startBooking()">${languages[currentLanguage].makeTicket}</button> <button onclick="cancelTicket()">${languages[currentLanguage].cancelTicket}</button>`, "bot");
}

function handleInput(input) {
    if (currentFlow.length > 0) {
        const currentField = currentFlow[currentStep].field;
        if (currentField) {
            if (currentField === "date") {
                input = document.getElementById("date-input").value;
                document.getElementById("date-input").style.display = "none";
                if (!isValidDate(input)) {
                    displayMessage(languages[currentLanguage].wrongDate, "bot");
                    return;
                }
                userData.date = input;
                displayMessage(languages[currentLanguage].dateDisplay.replace("{date}", formatDate(input)), "bot");
            } else {
                userData[currentField] = input;

                if (currentField === "name") {
                    displayMessage(languages[currentLanguage].niceToMeet.replace("{name}", userData.name), "bot");
                }
            }
        }
        currentStep++;
        if (currentStep < currentFlow.length) {
            let nextQuestion = currentFlow[currentStep].question;
            if (currentField === "name") {
                nextQuestion = nextQuestion.replace("{name}", userData.name);
            }
            displayMessage(nextQuestion, "bot");
            if (currentFlow[currentStep].field === "date") {
                document.getElementById("date-input").style.display = "block";
            }
        } else {
            // If flow reaches the end, display payment options
            if (currentFlow.length > 0 && currentFlow[currentFlow.length - 1].field === null) {
                displayPaymentOptions();
            }
        }
    } else {
        displayMessage(languages[currentLanguage].help, "bot");
    }
}

window.startBooking = function () {
    currentFlow = bookingFlow.map(step => ({
        ...step,
        question: languages[currentLanguage][step.question]
    }));
    currentStep = 0;
    displayMessage(currentFlow[currentStep].question, "bot");
}

window.cancelTicket = function () {
    currentFlow = cancelFlow.map(step => ({
        ...step,
        question: languages[currentLanguage][step.question]
    }));
    currentStep = 0;
    displayMessage(currentFlow[currentStep].question, "bot");
}

// function handleSubmit() {
//     const inputField = document.getElementById("input");
//     const input = inputField.value.trim();
//     if (input) {
//         inputField.value = "";
//         handleInput(input);
//     }
// }

function displayMessage(text, sender) {
    const messagesContainer = document.getElementById("messages");
    let messageDiv = document.createElement("div");
    messageDiv.className = sender === "bot" ? "bot response" : "user response";
    messageDiv.innerHTML = `<span>${text}</span>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regex)) return false;

    const date = new Date(dateString);
    const timestamp = date.getTime();

    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
    return dateString === date.toISOString().split('T')[0];
}

function generateTicketIDs(count) {
    let ticketIDs = [];
    for (let i = 0; i < count; i++) {
        ticketIDs.push(Math.floor(Math.random() * 900000) + 100000);
    }
    return ticketIDs;
}

function displayPaymentOptions() {
    const paymentOptions = `
        <div style="display: flex; flex-direction: column; align-items: center; margin: 20px;">
            <button onclick="payWith('GPay')">${languages[currentLanguage].gPay}</button>
            <button onclick="payWith('PhonePe')">${languages[currentLanguage].phonePe}</button>
            <button onclick="payWith('NetBanking')">${languages[currentLanguage].netBanking}</button>
        </div>
    `;
    displayMessage(languages[currentLanguage].paymentQuestion, "bot");
    displayMessage(paymentOptions, "bot");
}

window.payWith = function (method) {
    userData.paymentMethod = method;
    userData.ticketIDs = generateTicketIDs(userData.numberOfTickets);
    displayMessage(languages[currentLanguage].thankYou, "bot");
    displayMessage(languages[currentLanguage].ticketIDs.replace("{ticketIDs}", userData.ticketIDs.join(', ')), "bot");
    displayMessage(languages[currentLanguage].viewGallery, "bot");
}

function displayMuseumOptions() {
    const museumOptions = `
        <div style="display: flex; flex-direction: column; align-items: center; margin: 20px;">
            <button onclick="openMuseum('salarjung')">Salarjung Museum</button>
            <button onclick="openMuseum('birla')">Birla Science Museum</button>
            <button onclick="openMuseum('nizam')">Nizam Museum</button>
        </div>
    `;
    displayMessage("Please select a museum to explore:", "bot");
    displayMessage(museumOptions, "bot");
}

function openMuseum(museum) {
    let url;
    switch(museum) {
        case 'salarjung':
            url = 'https://www.salarjungmuseum.in/photo-gallery.html';
            break;
        case 'birla':
            url = 'https://gpbaasri.org/';
            break;
        case 'nizam':
            url = 'https://www.thenizamsmuseum.com/';
            break;
    }
    if (url) {
        window.open(url, '_blank');
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(currentLanguage, options);
}

const bookingFlow = [
    { field: "name", question: "nameQuestion" },
    { field: "phone", question: "phoneQuestion" },
    { field: "email", question: "emailQuestion" },
    { field: "numberOfTickets", question: "ticketCountQuestion" },
    { field: "date", question: "dateQuestion" },
    { field: null, question: "paymentQuestion" }
];

const cancelFlow = [
    { field: "cancelName", question: "cancelNameQuestion" }
];

const languages = {
    en: {
        welcome: "Hi there! 👋<br>Welcome to our museum. We are thrilled to dive you into the world of antics...!!",
        help: "How can I help you today?",
        makeTicket: "Make a ticket",
        cancelTicket: "Cancel a ticket",
        additionalTickets: "Additional tickets",
        nameQuestion: "Let's begin with your name.",
        niceToMeet: "Nice to meet you, {name}!",
        phoneQuestion: "Lovely! And your phone number?",
        emailQuestion: "Great! Could you please provide your email?",
        ticketCountQuestion: "How many people should I book for?",
        dateQuestion: "When will you be visiting?",
        wrongDate: "Wrong date format. Please use YYYY-MM-DD.",
        dateDisplay: "You have chosen {date}.",
        thankYou: "Thank you for your booking!",
        ticketIDs: "Your ticket IDs are: {ticketIDs}",
        paymentQuestion: "Please choose your payment method:",
        gPay: "Pay with GPay",
        phonePe: "Pay with PhonePe",
        netBanking: "Pay with NetBanking",
        viewGallery: "You can view the gallery of the museums by clicking the buttons below:",
        cancelNameQuestion: "To cancel your booking, please provide your name."
    },
    hi: {
        welcome: "नमस्ते! 👋<br>हमारे संग्रहालय में आपका स्वागत है। हम आपको प्राचीन वस्तुओं की दुनिया में ले जाने के लिए उत्साहित हैं...!!",
        help: "मैं आपकी कैसे मदद कर सकता हूँ?",
        makeTicket: "टिकट बनाएं",
        cancelTicket: "टिकट रद्द करें",
        additionalTickets: "अतिरिक्त टिकट",
        nameQuestion: "चलिये, सबसे पहले आपका नाम बताएं।",
        niceToMeet: "आपसे मिलकर अच्छा लगा, {name}!",
        phoneQuestion: "सुंदर! और आपका फोन नंबर?",
        emailQuestion: "अच्छा! कृपया अपना ईमेल प्रदान करें।",
        ticketCountQuestion: "कितने लोगों के लिए बुकिंग करनी है?",
        dateQuestion: "आप कब आ रहे हैं?",
        wrongDate: "गलत तारीख का प्रारूप। कृपया YYYY-MM-DD का उपयोग करें।",
        dateDisplay: "आपने {date} को चुना है।",
        thankYou: "आपकी बुकिंग के लिए धन्यवाद!",
        ticketIDs: "आपके टिकट आईडी हैं: {ticketIDs}",
        paymentQuestion: "कृपया अपना भुगतान विधि चुनें:",
        gPay: "GPay से भुगतान करें",
        phonePe: "PhonePe से भुगतान करें",
        netBanking: "नेटबैंकिंग से भुगतान करें",
        viewGallery: "आप संग्रहालयों की गैलरी देखने के लिए नीचे दिए गए बटन पर क्लिक कर सकते हैं:",
        cancelNameQuestion: "अपनी बुकिंग रद्द करने के लिए, कृपया अपना नाम प्रदान करें।"
    },
    te: {
        welcome: "హాయ్! 👋<br>మా మ్యూజియంలో మీకు స్వాగతం. ప్రాచీన వస్తువుల ప్రపంచంలోకి మీను తీసుకెళ్లడానికి మేము ఉత్సాహంగా ఉన్నాము...!!",
        help: "నేను మీకు ఎలా సహాయం చేయగలను?",
        makeTicket: "టికెట్ తయారు చేయండి",
        cancelTicket: "టికెట్ రద్దు చేయండి",
        additionalTickets: "అదనపు టికెట్లు",
        nameQuestion: "ప్రారంభంగా మీ పేరు చెప్పండి.",
        niceToMeet: "మీతో కలవడం మంచి విషయం, {name}!",
        phoneQuestion: "అద్భుతం! మరియు మీ ఫోన్ నంబర్?",
        emailQuestion: "చెప్పండి! దయచేసి మీ ఇమెయిల్ ఇవ్వండి.",
        ticketCountQuestion: "ఎన్ని మందికి బుక్ చేయాలి?",
        dateQuestion: "మీరు ఎప్పుడు రాబోతున్నారు?",
        wrongDate: "తప్పు తేదీ ఫార్మాట్. దయచేసి YYYY-MM-DD ఉపయోగించండి.",
        dateDisplay: "మీరు {date} న ఎంపిక చేశారు.",
        thankYou: "మీ బుకింగ్ కోసం ధన్యవాదాలు!",
        ticketIDs: "మీ టికెట్ ID లు: {ticketIDs}",
        paymentQuestion: "దయచేసి మీ చెల్లింపు పద్ధతిని ఎంచుకోండి:",
        gPay: "GPay తో చెల్లించండి",
        phonePe: "PhonePe తో చెల్లించండి",
        netBanking: "నెట్‌బ్యాంకింగ్‌తో చెల్లించండి",
        viewGallery: "మీరు క్రింద ఇచ్చిన బటన్లపై క్లిక్ చేసి మ్యూజియమ్స్ యొక్క గ్యాలరీని వీక్షించవచ్చు:",
        cancelNameQuestion: "మీ బుకింగ్‌ను రద్దు చేయడానికి, దయచేసి మీ పేరు ఇవ్వండి."
    }
};
