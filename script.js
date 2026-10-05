
// Event Data
let events = [
    {
        id: 1,
        title: "Author Meet & Greet",
        date: "2026-10-10",
        start: "17:00",
        end: "18:30",
        location: "Main Bookstore",
        description: "Meet a local author."
    }
];

const $ = id => document.getElementById(id);

const modal = $("modal");
const form = $("eventForm");
const list = $("events");
const loading = $("loading");
const error = $("error");
// Security

// Basic XSS sanitization before storing text
function sanitize(text) {
    return text.trim().replace(/[<>]/g, "");
}
// Analytics

function analytics(action) {
    console.log(
        "Analytics: User interacted with Independent Bookstore Event Page",
        "| Action:", action
    );
}
// Empty State


function showEmpty(message) {

    list.innerHTML = "";

    const box = document.createElement("div");
    box.className = "message";

    const heading = document.createElement("h2");
    heading.textContent = message;

    const text = document.createElement("p");
    text.textContent = "Try changing your search or filter.";

    box.append(heading, text);
    list.appendChild(box);
}
// Display Events

function render() {

    const search = $("search").value.toLowerCase().trim();
    const filter = $("filter").value;
    const today = new Date().toISOString().split("T")[0];

    const result = events.filter(event => {

        const searchMatch =
            event.title.toLowerCase().includes(search) ||
            event.location.toLowerCase().includes(search);

        const filterMatch =
            filter === "all" ||
            (filter === "upcoming" && event.date >= today) ||
            (filter === "past" && event.date < today);

        return searchMatch && filterMatch;
    });

    list.innerHTML = "";

    // Never show a blank list
    if (!result.length) {

        let message = "No events found";

        if (search) {
            message = "No matching events found";
        } else if (filter === "upcoming") {
            message = "No upcoming events";
        } else if (filter === "past") {
            message = "No past events";
        }

        showEmpty(message);
        return;
    }

    result.forEach(event => {

        const card = document.createElement("article");
        card.className = "card";

        const title = document.createElement("h2");
        title.textContent = event.title;

        const info = document.createElement("p");
        info.textContent =
            `Date: ${event.date} | Time: ${event.start} - ${event.end}`;

        const location = document.createElement("p");
        location.textContent = `Location: ${event.location}`;

        const description = document.createElement("p");
        description.textContent =
            event.description || "No description available.";

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete Event";
        deleteBtn.className = "delete";
        deleteBtn.setAttribute(
            "aria-label",
            `Delete ${event.title}`
        );

        deleteBtn.onclick = () => deleteEvent(event.id);

        card.append(
            title,
            info,
            location,
            description,
            deleteBtn
        );

        list.appendChild(card);
    });
}
// Modal
function openModal() {
    modal.classList.remove("hidden");
    $("title").focus();
}

function closeModal() {
    modal.classList.add("hidden");
    form.reset();
    error.textContent = "";
    $("addBtn").focus();
}

$("addBtn").onclick = openModal;
$("closeBtn").onclick = closeModal;


// Close modal with Escape key
document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        !modal.classList.contains("hidden")
    ) {
        closeModal();
    }
});
// Add Event
form.onsubmit = async event => {

    event.preventDefault();
    error.textContent = "";

    // Check required fields
    if (!form.checkValidity()) {
        error.textContent =
            "Please fill all required fields and try again.";
        return;
    }

    // Check time
    if ($("start").value >= $("end").value) {
        error.textContent =
            "End time must be after start time. Please try again.";
        return;
    }

    // Sanitize text before storing in state
    const newEvent = {
        id: Date.now(),
        title: sanitize($("title").value),
        date: $("date").value,
        start: $("start").value,
        end: $("end").value,
        location: sanitize($("location").value),
        description: sanitize($("description").value)
    };

    const saveBtn = $("saveBtn");

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    // Show loading during async operation
    loading.classList.remove("hidden");

    try {

        // Simulate slow 3G / API request
        await new Promise(resolve => setTimeout(resolve, 800));

        events.push(newEvent);

        closeModal();
        render();

        analytics("Event Added");

    } catch (err) {

        error.textContent =
            "Something went wrong. Please try again.";

    } finally {

        saveBtn.disabled = false;
        saveBtn.textContent = "Save Event";
        loading.classList.add("hidden");
    }
};
// Delete Event
function deleteEvent(id) {

    const eventExists = events.some(event => event.id === id);

    if (!eventExists) {
        return;
    }

    events = events.filter(event => event.id !== id);

    render();

    analytics("Event Deleted");
}
// Search

$("search").addEventListener("input", () => {
    render();
});


// Track search after user finishes typing
$("search").addEventListener("change", () => {
    analytics("Search Performed");
});
// Filter

$("filter").addEventListener("change", () => {

    render();

    analytics("Filter Changed");
});
// Initial Loading

function loadEvents() {

    loading.classList.remove("hidden");

    // Simulates slow internet
    setTimeout(() => {

        loading.classList.add("hidden");
        render();

    }, 700);
}


// Start application
loadEvents();