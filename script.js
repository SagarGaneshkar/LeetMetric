document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search-btn");
  const userInput = document.getElementById("userinput");
  const statsContainer = document.querySelector(".stats-container");

  const easyLabel = document.getElementById("easy-label");
  const mediumLabel = document.getElementById("medium-label");
  const hardLabel = document.getElementById("hard-label");

  const easyProgressCircle = document.querySelector(".easy-progress");
  const mediumProgressCircle = document.querySelector(".medium-progress");
  const hardProgressCircle = document.querySelector(".hard-progress");

  const cardStatsContainer = document.querySelector(".stats-card");
  function validateUsername(username) {
    if (username.trim() === "") {
      alert("Username should not be empty!");
      return false;
    }
    return true;
  }
  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 360;
    circle.style.setProperty("--progress-degree", `${progressDegree}deg`);
    label.textContent = `${solved} / ${total}`;
  }

  function displayUserData(parsedData) {
    // Implement data processing and display logic here
    const totalQues = parsedData.data.allQuestionsCount[0].count;
    const totalQuesEasy = parsedData.data.allQuestionsCount[1].count;
    const totalQuesMedium = parsedData.data.allQuestionsCount[2].count;
    const totalQuesHard = parsedData.data.allQuestionsCount[3].count;

    const solvedTotalQues =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
    const solvedTotalQuesEasy =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
    const solvedTotalQuesMedium =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
    const solvedTotalQuesHard =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

    updateProgress(
      solvedTotalQuesEasy,
      totalQuesEasy,
      easyLabel,
      easyProgressCircle
    );
    updateProgress(
      solvedTotalQuesMedium,
      totalQuesMedium,
      mediumLabel,
      mediumProgressCircle
    );
    updateProgress(
      solvedTotalQuesHard,
      totalQuesHard,
      hardLabel,
      hardProgressCircle
    );

    const cardsData = [
      {
        label: "Overall Submissions",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[0]
            .submissions,
      },
      {
        label: "Overall Easy Submissions",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[1]
            .submissions,
      },
      {
        label: "Overall Medium Submissions",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[2]
            .submissions,
      },
      {
        label: "Overall Hard Submissions",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[3]
            .submissions,
      },
    ];
    console.log("Card ka Data:", cardsData);

    cardStatsContainer.innerHTML = cardsData
      .map((data) => {
        return `  
      <div class="card">
      <h4>${data.label}</h4>
      <p>${data.value}</p></div>
      `;
      })
      .join("");
  }
  async function fetchUserDetails(username) {
    try {
      searchButton.textContent = "Searching...";
      searchButton.disabled = true;

      const proxyUrl = "http://localhost:8080/";
      const targetUrl = "https://leetcode.com/graphql/";

      const myHeaders = new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      });

      const graphql = JSON.stringify({
        query: `
          query userSessionProgress($username: String!) {
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
                totalSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
            }
          }
        `,
        variables: { username: username },
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
      };

      const response = await fetch(proxyUrl + targetUrl, requestOptions);

      if (!response.ok) {
        console.error(`HTTP Error: ${response.status}`);
        statsContainer.innerHTML = `<p>LeetCode API request failed. Please try again later.</p>`;
        return;
      }

      const parsedData = await response.json();
      console.log(parsedData);
      // Process and display the fetched data

      displayUserData(parsedData);
    } catch (error) {
      console.error("Fetch Error:", error);
      statsContainer.innerHTML = `<p>Failed to fetch data. Please check console for details.</p>`;
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  searchButton.addEventListener("click", function () {
    const username = userInput.value.trim();
    console.log(username);
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });
});
