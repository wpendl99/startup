let user = JSON.parse(localStorage.getItem("user"));

// Global Variable
// Excursions data
let excursions = [];
let likedExcursions = [];

window.addEventListener("load", async function () {
	// Get Excursions
	try {
		// Get the latest excursions from the server
		let responseExcursions = await fetch("/api/excursions");
		excursions = await responseExcursions.json();

		// Save the excursions in case we go offline in the future
		localStorage.setItem("excursions", JSON.stringify(excursions));
	} catch {
		// If there was an error then just use the last saved excursions
		let excursionsText = localStorage.getItem("excursions");
		if (excursionsText) {
			excursions = JSON.parse(excursionsText);
		}
	}

	// Get Liked Excursions
	if (user) {
		try {
			// Get liked excursions for user
			const responseLikedExcursions = await fetch("/api/excursions/likes");
			likedExcursions = await responseLikedExcursions.json();
			likedExcursions = likedExcursions.map((obj) => obj._id);

			// Save the likes in case we go offline in the future
			localStorage.setItem("likedExcursions", JSON.stringify(likedExcursions));
		} catch {
			// If there was an error then just use the last saved excursions
			const likedExcursionsText = localStorage.getItem("likedExcursions");

			if (likedExcursionsText) {
				likedExcursions = JSON.parse(likedExcursionsText);
			}
		}
	}

	// load initial data
	for (let i = 0; i < excursions.length; i++) {
		const excursion = excursions[i];

		const li = document.createElement("li");
		li.classList.add("excursions-card");
		const idInput = document.createElement("input");
		idInput.id = "excursion-card-id";
		idInput.setAttribute("readonly", "");
		idInput.setAttribute("unselectable", "on");
		idInput.setAttribute("value", excursion._id);
		li.appendChild(idInput);

		const img = document.createElement("img");
		img.classList.add("img-fluid", "imp");
		img.setAttribute("src", excursion.coverPhoto);

		const gradientDiv = document.createElement("div");
		gradientDiv.classList.add("excursions-card-gradient");

		const iconsDiv = document.createElement("div");
		iconsDiv.classList.add("card-icons");

		if (user) {
			const heartSpan = document.createElement("span");
			heartSpan.classList.add("heart-icon");
			const heartIcon = document.createElement("i");
			// Check to see if the excursion is liked
			if (likedExcursions.indexOf(excursion._id) >= 0) {
				heartIcon.classList.add("fas", "fa-heart");
				heartSpan.classList.add("heart-liked");
			} else {
				heartIcon.classList.add("fas", "fa-heart");
				heartSpan.classList.add("heart-unliked");
			}
			heartSpan.appendChild(heartIcon);
			iconsDiv.appendChild(heartSpan);
		}

		if (excursion.vrReady) {
			const vrSpan = document.createElement("span");
			vrSpan.classList.add("vr-icon");
			const vrIcon = document.createElement("i");
			vrIcon.classList.add("fas", "fa-vr-cardboard");
			vrSpan.appendChild(vrIcon);
			iconsDiv.appendChild(vrSpan);
		}

		const textDiv = document.createElement("div");
		textDiv.classList.add("excursions-card-text");

		const titleH3 = document.createElement("h3");
		titleH3.textContent = excursion.title;

		const numStops = excursion.stops ? excursion.stops.length : 0;
		const subtitleP = document.createElement("p");
		subtitleP.classList.add("excursions-card-subtitle");
		subtitleP.textContent = `${numStops} stop${
			excursion.stops == 1 ? "" : "s"
		}`;

		textDiv.appendChild(titleH3);
		textDiv.appendChild(subtitleP);

		li.appendChild(img);
		li.appendChild(gradientDiv);
		li.appendChild(iconsDiv);
		li.appendChild(textDiv);

		if (user && excursion.creator === user.username) {
			document.getElementById("your-excursions").appendChild(li);
		} else {
			document.getElementById("other-excursions").appendChild(li);
		}
	}

	updateExcursions();
});

const updateExcursions = () => {
	const yourExcursions = document.getElementById("your-excursions");
	// Check if user exists
	if (!user) {
		// If user doesn't exist, append sign in message & hide Create modal button
		const message = document.createElement("p");
		message.innerHTML = `<a href="./signin.html" class="inline-red-link">Sign in</a> to start creating your excursions!`;
		message.classList.add("excursions-message");
		yourExcursions.appendChild(message);
		yourExcursions.style.display = "flex";
		yourExcursions.style.flexDirection = "column";
		// Hide Button
		$("#create-modal-button").toggle(false);
	} else if (yourExcursions.childElementCount === 0) {
		// If they do exists, append create excursion message and show button
		const message = document.createElement("p");
		message.textContent =
			"Click the '+' sign to start creating your excursions!";
		message.classList.add("excursions-message");
		yourExcursions.appendChild(message);
		yourExcursions.style.display = "flex";
		yourExcursions.style.flexDirection = "column";
		// Show Button
		$("#create-modal-button").toggle(true);
	} else {
		yourExcursions.style.display = "grid";
		// Show Button
		$("#create-modal-button").toggle(true);
	}
};

async function getUser(email) {
	try {
		const response = await fetch(`/api/user/${email}`);
		if (response.status === 200) {
			return response.json();
		} else if (response.status === 404) {
			return false;
		} else {
			throw new Error("Error fetching user data");
		}
	} catch (error) {
		console.log(error);
		throw new Error("Error fetching user data");
	}
}
