const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Temporary data
let users = [
   {
        id: 1,
        name: "Demo Student",
        email: "student@example.com",
        password: "123456",
        role: "student"
    },

    // Faculty 1
    {
         id: 2,
    name: "Ms. Jyoti Pasi",
    department: "MCA",
    section: "C Section",
    designation: "Class Coordinator",
    email: "jyoti@college.com",
    password: "123456",
    role: "faculty"
    },

    // Faculty 2
    {
        id: 3,
        name: "Mr. Sandeep Kumar",
        designation: "Faculty",
        email: "sandeep@college.com",
        password: "123456",
        role: "faculty"
    },

    // Faculty 3
    {
        id: 4,
        name: "Dr. Prashant Kumar",
        designation: "Placement Coordinator",
        email: "prashant@college.com",
        password: "123456",
        role: "faculty"
    },

    // Faculty 4
    {
        id: 5,
        name: "Nayla Sherwani",
        designation: "Faculty",
        email: "nayla@college.com",
        password: "123456",
        role: "faculty"
    }
];

let availability = [

  
    {
        id: 1,
        facultyId: 2,
        date: "2026-08-10",
        time: "10:00"
    },

    {
        id: 2,
        facultyId: 2,
        date: "2026-08-10",
        time: "11:00"
    },

    {
        id: 3,
        facultyId: 2,
        date: "2026-08-10",
        time: "14:00"
    },

    {
        id: 4,
        facultyId: 2,
        date: "2026-08-11",
        time: "10:00"
    },


   

    {
        id: 5,
        facultyId: 3,
        date: "2026-08-10",
        time: "10:00"
    },

    {
        id: 6,
        facultyId: 3,
        date: "2026-08-10",
        time: "12:00"
    },

    {
        id: 7,
        facultyId: 3,
        date: "2026-08-11",
        time: "15:00"
    },


  
    // DR. PRASHANT KUMAR
    // Placement Coordinator
    // Faculty ID = 4
   
    {
        id: 8,
        facultyId: 4,
        date: "2026-08-10",
        time: "11:00"
    },

    {
        id: 9,
        facultyId: 4,
        date: "2026-08-10",
        time: "15:00"
    },

    {
        id: 10,
        facultyId: 4,
        date: "2026-08-12",
        time: "12:00"
    },


    
    // NAYLA SHERWANI
    // Faculty ID = 5
   

    {
        id: 11,
        facultyId: 5,
        date: "2026-08-10",
        time: "10:30"
    },

    {
        id: 12,
        facultyId: 5,
        date: "2026-08-11",
        time: "11:30"
    },

    {
        id: 13,
        facultyId: 5,
        date: "2026-08-12",
        time: "14:30"
    }

];
let appointments = [];


// LOGIN
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    const user = users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    });
});


// REGISTER 

app.post("/api/register", (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const existingUser = users.find(
        u => u.email === email
    );

    if (existingUser) {
        return res.status(409).json({
            message: "Email already registered"
        });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        role: "student"
    };

    users.push(newUser);

    res.json({
        message: "Registration successful"
    });
});


//  GET FACULTY 

app.get("/api/faculty", (req, res) => {

    const faculty = users
        .filter(u => u.role === "faculty")
        .map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            designation: u.designation,
            department: u.department,
            section: u.section
        }));

    res.json(faculty);
});


//  GET AVAILABILITY 

app.get("/api/availability/:facultyId", (req, res) => {

    const facultyId = req.params.facultyId;

    const slots = availability.filter(
        a => a.facultyId == facultyId
    );

    res.json(slots);
});


//  ADD AVAILABILITY 

app.post("/api/availability", (req, res) => {

    const { facultyId, date, time } = req.body;

    if (!facultyId || !date || !time) {
        return res.status(400).json({
            message: "Date and time are required"
        });
    }

    const slot = {
        id: Date.now(),
        facultyId: Number(facultyId),
        date,
        time
    };

    availability.push(slot);

    res.json({
        message: "Availability added",
        slot
    });
});


//  BOOK APPOINTMENT

app.post("/api/appointments", (req, res) => {

    const {
        studentId,
        facultyId,
        date,
        time,
        reason
    } = req.body;

    const slot = availability.find(
        a =>
            a.facultyId == facultyId &&
            a.date === date &&
            a.time === time
    );

    if (!slot) {
        return res.status(400).json({
            message: "Selected slot is not available"
        });
    }

    const alreadyBooked = appointments.find(
        a =>
            a.facultyId == facultyId &&
            a.date === date &&
            a.time === time &&
            a.status !== "Rejected"
    );

    if (alreadyBooked) {
        return res.status(409).json({
            message: "Slot already booked"
        });
    }

    const appointment = {
        id: appointments.length + 1,
        studentId: Number(studentId),
        facultyId: Number(facultyId),
        date,
        time,
        reason,
        status: "Pending"
    };

    appointments.push(appointment);

    res.json({
        message: "Appointment booked successfully", appointment
    });
});


//  STUDENT APPOINTMENTS 

app.get("/api/appointments/student/:id", (req, res) => {

    const studentId = req.params.id;

    const result = appointments.filter(a => a.studentId == studentId) .map(addNames);

    res.json(result);
});


//  FACULTY APPOINTMENTS 

app.get("/api/appointments/faculty/:id", (req, res) => {

    const facultyId = req.params.id;

    const result = appointments.filter(a => a.facultyId == facultyId) .map(addNames);

    res.json(result);
});


//  ACCEPT / REJECT 

app.patch("/api/appointments/:id", (req, res) => {

    const { status } = req.body;

    const appointment = appointments.find(
        a => a.id == req.params.id
    );

    if (!appointment) {
        return res.status(404).json({
            message: "Appointment not found"
        });
    }

    appointment.status = status;

    res.json({
        message: "Appointment updated",
        appointment
    });
});


// ADD USER NAMES

function addNames(appointment) {

    const student = users.find(
        u => u.id === appointment.studentId
    );

    const faculty = users.find(
        u => u.id === appointment.facultyId
    );

    return {
        ...appointment,
        studentName: student
            ? student.name
            : "Student",

        facultyName: faculty
            ? faculty.name
            : "Faculty"
    };
}


//home

app.get("*", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});
//server

app.listen(3000, () => {

    console.log(
        "Server running at http://localhost:3000"
    );

});