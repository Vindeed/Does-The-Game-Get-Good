class ReviewAnalyzer {
	constructor(gameName, gameId, numHoursUntilGood) {
		this.gameName = gameName;
		this.gameId = gameId;
		this.numHoursUntilGood = numHoursUntilGood;
		this.MAX_NUM_QUERIES = 150;
		this.reviewInfo = {
			cumulativeScoreAboveHours: 0,
			reviewsAboveHours: 0,
			cumulativeScoreBelowHours: 0,
			reviewsBelowHours: 0,
			cursor: "*",
		};
	}

	doesTheGameGetGood() {
		const averageScoreAboveHours =
			this.reviewInfo.cumulativeScoreAboveHours /
			this.reviewInfo.reviewsAboveHours;
		const averageScoreBelowHours =
			this.reviewInfo.cumulativeScoreBelowHours /
			this.reviewInfo.reviewsBelowHours;

		if (averageScoreAboveHours > averageScoreBelowHours) {
			return true;
		}

		return false;
	}

	getAverageScoreAboveHours() {
		return (
			this.reviewInfo.cumulativeScoreAboveHours /
			this.reviewInfo.reviewsAboveHours
		);
	}

	getAverageScoreBelowHours() {
		return (
			this.reviewInfo.cumulativeScoreBelowHours /
			this.reviewInfo.reviewsBelowHours
		);
	}

	getAnalysisMessageForGame() {
		const analysisMessages = analysisMessageObject();
		const analysisKeyDecimal =
			(this.getAverageScoreAboveHours() -
				this.getAverageScoreBelowHours()) *
			10;
		const analysisKey = Math.round(analysisKeyDecimal);

		console.log(`Score above hours: ${this.getAverageScoreAboveHours()}`);
		console.log(`Score below hours: ${this.getAverageScoreBelowHours()}`);

		if (analysisKey < 10) {
			return analysisMessages[analysisKey];
		}

		return analysisMessages[9];
	}
}

async function init() {}
async function getSteamApps() {}
function populateSteamAppCards(searchedText, apps) {}
function findAppID(searchedText, apps) {}
function reviewSearchClick(gameName, gameId) {}
function showLoadingGif() {}
async function getReviews(gameReviewAnalyzer) {}
async function getReviewApiCall(gameReviewAnalyzer) {}
function editGameReviewInfo(gameReviewAnalyzer, element) {}
function showOutputMessage(gameReviewAnalyzer) {}

function analysisMessageObject() {}

const MAX_NUM_QUERIES = 150;

init();

async function init() {
	const apps = await getSteamApps();

	const gameNameTextBox = document.getElementById("gameName");
	const buttonContainer = document.querySelector(".game-cards");
	const searchButton = document.getElementById("searchButton");
	const gameCardContainer = document.querySelector(
		"[data-game-cards-container]"
	);
	const outputContainer = document.querySelector("[output-container]");

	let gameName;
	let gameId;

	gameNameTextBox.addEventListener("input", (event) => {
		searchButton.disabled = true;
		outputContainer.innerHTML = "";

		const searchedText = event.target.value.toLowerCase();
		populateSteamAppCards(searchedText, apps);
	});

	buttonContainer.addEventListener("click", function (event) {
		searchButton.disabled = false;

		if (event.target.tagName == "BUTTON") {
			gameNameTextBox.value = event.target.innerText;
			gameName = gameNameTextBox.value;
			gameId = findAppID(gameNameTextBox.value, apps);
		}
	});

	searchButton.addEventListener("click", () => {
		console.log("\n\nSearched\n");
		gameCardContainer.innerHTML = "";
		outputContainer.innerHTML = "";
		reviewSearchClick(gameName, gameId);
	});
}

function populateSteamAppCards(searchedText, apps) {
	const gameCardContainer = document.querySelector(
		"[data-game-cards-container]"
	);
	const gameCardTemplate = document.querySelector("[data-game-template]");

	if (searchedText.length < 4) {
		return;
	}

	gameCardContainer.innerHTML = "";

	apps.forEach((app) => {
		if (app.name.toLowerCase().includes(searchedText)) {
			const card = gameCardTemplate.content.cloneNode(true).children[0];
			const header = card.querySelector("[data-header]");
			const appid = card.querySelector("[data-appid]");
			header.textContent = app.name;
			appid.textContent = app.appid;
			gameCardContainer.append(card);
		}
	});
}

async function getSteamApps() {
	const apiUrl = "https://api.steampowered.com/ISteamApps/GetAppList/v2/";

	const response = await fetch(apiUrl)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			data = data.applist.apps;
			return data;
		})
		.catch((error) => {
			console.error("Error:", error);
		});

	return response;
}

function findAppID(searchedText, apps) {
	let appId;
	apps.forEach((app) => {
		if (app.name == searchedText) {
			appId = app.appid;
		}
	});

	return appId;
}

async function reviewSearchClick(gameName, gameId) {
	const numHoursTextBox = document.getElementById("numHours");

	const gameReviewAnalyzer = new ReviewAnalyzer(
		gameName,
		gameId,
		parseInt(numHoursTextBox.value)
	);

	console.log(gameReviewAnalyzer.gameName);
	console.log(gameReviewAnalyzer.gameId);
	console.log(gameReviewAnalyzer.numHoursUntilGood);

	if (isNaN(gameReviewAnalyzer.numHoursUntilGood)) {
		alert("The hours inputted is not a number :(");
		return;
	}

	if (
		gameReviewAnalyzer.numHoursUntilGood < 0 ||
		gameReviewAnalyzer.numHoursUntilGood == Number.MAX_VALUE
	) {
		alert("How can you enjoy a game while time travelling?");
		return;
	}

	if (
		gameReviewAnalyzer.numHoursUntilGood == 0 ||
		gameReviewAnalyzer.numHoursUntilGood == Number.MAX_VALUE
	) {
		alert("Well this is awkward.. you haven't played the game yet.");
		return;
	}

	showLoadingGif();
	// maybe make it so it stores all data in hash when steam game gets chosen
	// to save request time
	getReviews(gameReviewAnalyzer);
}

function showLoadingGif() {
	const outputContainer = document.querySelector("[output-container]");
	const loadingCircleTemplate = document.querySelector(
		"[loading-circle-template]"
	);

	outputContainer.innerHTML = "";

	const loadingCircle =
		loadingCircleTemplate.content.cloneNode(true).children[0];

	outputContainer.append(loadingCircle);
}

async function getReviews(gameReviewAnalyzer) {
	const outputContainer = document.querySelector("[output-container]");

	for (
		let i = 0;
		i < MAX_NUM_QUERIES - 140 &&
		gameReviewAnalyzer.reviewInfo.cursor != "NO MORE REVIEWS";
		i++
	) {
		await getReviewApiCall(gameReviewAnalyzer);
	}

	console.log("finished GET operation for reviews");

	outputContainer.innerHTML = "";
	showOutputMessage(gameReviewAnalyzer);
}

// maybe reduce size of this function
async function getReviewApiCall(gameReviewAnalyzer) {
	const apiUrl = `http://store.steampowered.com/appreviews/${
		gameReviewAnalyzer.gameId
	}?json=1&language=all&review_type=all&purchase_type=all&filter=recent&num_per_page=100&cursor=${encodeURIComponent(
		gameReviewAnalyzer.reviewInfo.cursor
	)}`;

	const response = await fetch(apiUrl)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			if (data.reviews.length < 100) {
				gameReviewAnalyzer.reviewInfo.cursor = "NO MORE REVIEWS";
			} else {
				gameReviewAnalyzer.reviewInfo.cursor = data.cursor;
			}

			data.reviews.forEach((element) =>
				editGameReviewInfo(gameReviewAnalyzer, element)
			);

			// console.log(data);
			// console.log(data.cursor);
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}

function editGameReviewInfo(gameReviewAnalyzer, element) {
	const numHoursPlayed = element.author.playtime_at_review;
	const score = element.voted_up == true ? 1 : -1;

	if (numHoursPlayed >= gameReviewAnalyzer.numHoursUntilGood * 60) {
		gameReviewAnalyzer.reviewInfo.cumulativeScoreAboveHours += score;
		gameReviewAnalyzer.reviewInfo.reviewsAboveHours++;
	} else {
		gameReviewAnalyzer.reviewInfo.cumulativeScoreBelowHours += score;
		gameReviewAnalyzer.reviewInfo.reviewsBelowHours++;
	}
}

function showOutputMessage(gameReviewAnalyzer) {
	const outputContainer = document.querySelector("[output-container]");
	const outputTextTemplate = document.querySelector("[output-text-template]");

	const outputMessage =
		outputTextTemplate.content.cloneNode(true).children[0];
	const outputMessageText = outputMessage.querySelector("[output-text]");

	if (
		gameReviewAnalyzer.reviewInfo.reviewsBelowHours == 0 ||
		gameReviewAnalyzer.reviewInfo.reviewsAboveHours == 0
	) {
		outputMessageText.textContent =
			"no reviews (or no reviews above or below the hours)";
		outputContainer.append(outputMessage);
		return;
	}

	if (gameReviewAnalyzer.doesTheGameGetGood() == false) {
		outputMessageText.textContent = "the game gets WORSE";
		outputContainer.append(outputMessage);
		return;
	}

	outputMessageText.textContent =
		gameReviewAnalyzer.getAnalysisMessageForGame();
	outputContainer.append(outputMessage);
}

function analysisMessageObject() {
	const analysisMessages = {
		0: "the games gets better, but by the slightest of slight margin",
		1: "the games gets better, but by the slightest margin",
		2: "the game gets better, but not by much",
		3: "the game gets better",
		4: "the game gets better",
		5: "the game gets alot better",
		6: "the game gets alot better",
		7: "the game gets better, by a super alot",
		8: "the game gets better, by a super alot",
		9: "WOW, the game gets a unfathomably better",
	};

	return analysisMessages;
}
