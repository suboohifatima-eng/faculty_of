
// Faculty Student Appointment System
 let currentUser = null;

// HELPER FUNCTION
function $(id) {
    return document.getElementById(id);
}



// SHOW LOGIN PAGE
function showLogin() {

    $("loginPage").classList.remove("hidden");

    $("registerPage").classList.add("hidden");

}

// SHOW REGISTER PAGE

function showRegister() {

    $("loginPage").classList.add("hidden");

    $("registerPage").classList.remove("hidden");

}
// LOGIN

async function login() {

    const email =
        $("loginEmail").value.trim();

    const password =
        $("loginPassword").value.trim();


    if (!email || !password) {

        $("loginMsg").innerHTML =
            `<p class="error">
                Please enter email and password.
            </p>`;

        return;
    }


    try {

        const response = await fetch(
            "/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            $("loginMsg").innerHTML =
                `<p class="error">
                    ${data.message}
                </p>`;

            return;
        }

 // Save logged-in user
        currentUser = data;

 // Hide login
        $("loginPage").classList .add("hidden");


        // Show dashboard
        $("dashboard").classList.remove("hidden");

     // Welcome message
        $("welcome").innerText =  "Welcome, " + currentUser.name;

      // STUDENT LOGIN
       

        if (
            currentUser.role === "student"
        ) {

            $("studentPanel") .classList.remove("hidden");


            $("facultyPanel").classList.add("hidden");

            // Load faculty
            await loadFaculty();

         // Load student's appointments
            await loadStudentAppointments();

        }

      // FACULTY LOGIN
       
         else if (
            currentUser.role === "faculty"
        ) {

            $("facultyPanel") .classList  .remove("hidden");


            $("studentPanel") .classList .add("hidden");

       // Load faculty appointments
            await loadFacultyAppointments();

        }

    }

    catch (error) {

        console.error(error);

        $("loginMsg").innerHTML =
            `<p class="error">
                Server error. Please try again.
            </p>`;

    }

}
// STUDENT REGISTRATION


async function register() {

    const name =
        $("regName").value.trim();

    const email =
        $("regEmail").value.trim();

    const password =
        $("regPassword").value.trim();


    if (!name || !email || !password) {

        $("regMsg").innerHTML =
            `<p class="error">
                Please fill all fields.
            </p>`;

        return;
    }


    try {

        const response = await fetch(
            "/api/register",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );


        const data =
            await response.json();


        $("regMsg").innerHTML =
            `<p class="${
                response.ok
                ? "ok"
                : "error"
            }">
                ${data.message}
            </p>`;


        if (response.ok) {

            // Clear fields

            $("regName").value = "";

            $("regEmail").value = "";

            $("regPassword").value = "";


            // Go back to login

            setTimeout(
                showLogin,
                1000
            );

        }

    }

    catch (error) {

        console.error(error);

        $("regMsg").innerHTML =
            `<p class="error">
                Server error. Please try again.
            </p>`;

    }

}
// LOAD ALL FACULTY

   async function loadFaculty() {

    try {

        const response =
            await fetch(
                "/api/faculty"
            );


        const faculty =
            await response.json();


        const facultySelect =
            $("facultySelect");


        // Clear existing options

        facultySelect.innerHTML = "";


        // If no faculty

        if (faculty.length === 0) {

            facultySelect.innerHTML =
                `<option>
                    No faculty available
                </option>`;

            return;
        }


        // Add faculty

        faculty.forEach(
            facultyMember => {

                const option =document.createElement( "option" );


                option.value = facultyMember.id;


                // Show name + designation
                // + department + section

                let displayText =facultyMember.name;


                if (facultyMember.designation) {

                    displayText += " — " +facultyMember.designation;

                }


                if ( facultyMember.department) {

                    displayText +=" | " + facultyMember.department;

                }


                if ( facultyMember.section) {
                    displayText += " | " +facultyMember.section;


                }

                     option.textContent = displayText;


                facultySelect.appendChild( option );
 }
        );


        // Load slots for first faculty
         await loadSlots();

    }

    catch (error) {

        console.error("Faculty loading error:", error);

    }

}
// LOAD AVAILABLE SLOTS
async function loadSlots() {

    const facultySelect = $("facultySelect");

   if (!facultySelect.value) {

        return;
    }
   const facultyId = facultySelect.value;


    try {

        const response = await fetch( "/api/availability/"+ facultyId );


        const slots =await response.json();


        const slotSelect = $("slotSelect");

    slotSelect.innerHTML = "";


        if (slots.length === 0) {

            slotSelect.innerHTML = `<option value=""> No available slots </option>`;

            return;
        }

    slots.forEach(
            slot => {

                const option = document.createElement("option");


                option.value =slot.date + "|" + slot.time;
     option.textContent = slot.date +  " — " +  slot.time;

      slotSelect.appendChild(option );

            }
        );

    }

    catch (error) {

        console.error(
            "Slot loading error:",
            error
        );

    }

}


// 
// BOOK APPOINTMENT


async function bookAppointment() {

    const slotValue = $("slotSelect").value;


    if (!slotValue) {

        alert(
            "Please select an available slot."
        );

        return;
    }


    const parts = slotValue.split("|");


    const date = parts[0];

    const time = parts[1];


    const facultyId = $("facultySelect").value;


    const reason = $("reason").value.trim();


    if (!reason) {

        alert(
            "Please enter the reason for appointment."
        );

        return;
    }


    const appointmentData = {

        studentId:  currentUser.id,

        facultyId:  Number(facultyId),

        date: date,

        time:  time,

        reason: reason

    };


    try {

        const response =
            await fetch(
                "/api/appointments",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            appointmentData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(
            "Appointment booked successfully!"
        );


        // Clear reason

        $("reason").value = "";


        // Refresh appointments

        await loadStudentAppointments();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to book appointment."
        );

    }

}



// LOAD STUDENT APPOINTMENTS


async function loadStudentAppointments() {

    try {

        const response =
            await fetch(
                "/api/appointments/student/"
                + currentUser.id
            );


        const appointments =
            await response.json();


        const container =
            $("studentAppointments");


        if (
            appointments.length === 0
        ) {

            container.innerHTML =
                `<p>
                    No appointments booked yet.
                </p>`;

            return;
        }


        container.innerHTML =  "";


        appointments.forEach(
            appointment => {

                const div =  document.createElement(
                        "div"
                    );


                div.className =  "appointment";


                div.innerHTML = `

                    <h3>
                        ${appointment.facultyName}
                    </h3>

                    <p>
                        <strong>Date:</strong>
                        ${appointment.date}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${appointment.time}
                    </p>

                    <p>
                        <strong>Reason:</strong>
                        ${appointment.reason}
                    </p>

                    <p>
                        <strong>Status:</strong>

                        <span class="status">
                            ${appointment.status}
                        </span>

                    </p>

                `;


                container.appendChild(
                    div
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Student appointment error:",
            error
        );

    }

}



// LOAD FACULTY APPOINTMENT REQUESTS


async function loadFacultyAppointments() {

    try {

        const response =
            await fetch(
                "/api/appointments/faculty/"
                + currentUser.id
            );


        const appointments =
            await response.json();


        const container =
            $("facultyAppointments");


        if (
            appointments.length === 0
        ) {

            container.innerHTML =
                `<p> No appointment requests. </p>`;

            return;
        }


        container.innerHTML = "";


        appointments.forEach(
            appointment => {

                const div =  document.createElement(
                        "div"
                    );


                div.className ="appointment";


                let buttons = "";


                // Show buttons only
                // for pending request

                if (
                    appointment.status ===
                    "Pending"
                ) {

                    buttons = `

                        <button onclick=" updateAppointment(
                                    ${appointment.id},
                                    'Accepted') " >  Accept </button>


                        <button
                            class="secondary" onclick="updateAppointment( 
                            ${appointment.id}, 'Rejected' ) "> Reject
                        </button>

                    `;

                }


                div.innerHTML = `

                    <h3>
                        Student:
                        ${appointment.studentName}
                    </h3>

                    <p>
                        <strong>Date:</strong>
                        ${appointment.date}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${appointment.time}
                    </p>

                    <p>
                        <strong>Reason:</strong>
                        ${appointment.reason}
                    </p>

                    <p>
                        <strong>Status:</strong>

                        <span class="status">
                            ${appointment.status}
                        </span>

                    </p> ${buttons} `;


                container.appendChild( div );

            }
        );

    }

    catch (error) {

        console.error(
            "Faculty appointment error:", error
        );

    }

}

// ACCEPT / REJECT APPOINTMENT


async function updateAppointment(
    appointmentId,
    status
) {

    try {

        const response =
            await fetch(
                "/api/appointments/" + appointmentId,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status: status
                        })
                }
            );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.message ||  "Unable to update appointment."
            );

            return;
        }


        alert(
            "Appointment " + status.toLowerCase() +  " successfully."
        );


        // Refresh faculty appointments

        await loadFacultyAppointments();

    }

    catch (error) {

        console.error(error);

        alert(
            "Server error."
        );

    }

}

// ADD FACULTY AVAILABILITY


async function addAvailability() {

    const date = $("availDate").value;


    const time =  $("availTime").value;


    if (!date || !time) {

        alert(
            "Please select date and time."
        );

        return;
    }


    try {

        const response = await fetch(
                "/api/availability",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":  "application/json"
                    },

                    body: JSON.stringify({

                            facultyId:  currentUser.id,

                            date: date,

                            time: time

                        })
                }
            );


        const data =  await response.json();


        if (!response.ok) {

            alert(
                data.message
            );

            return;
        }


        alert(
            "Availability added successfully!"
        );


        // Clear fields

        $("availDate").value = "";

        $("availTime").value = "";

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to add availability."
        );

    }

}


// LOGOUT


function logout() {

    currentUser = null;


    // Hide dashboard

    $("dashboard") .classList .add("hidden");


    // Hide student panel

    $("studentPanel").classList .add("hidden");


    // Hide faculty panel

    $("facultyPanel").classList.add("hidden");


    // Clear login fields

    $("loginEmail").value = "";

    $("loginPassword").value = "";


    // Show login

    showLogin();

}



// INITIAL PAGE


document.addEventListener(
    "DOMContentLoaded",
    function () {

        showLogin();

    }
);