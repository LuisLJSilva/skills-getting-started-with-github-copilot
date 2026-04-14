document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participantsMarkup = details.participants.length
          ? details.participants.map((participant) => `
              <li class="participant-item">
                <span class="participant-email">${participant}</span>
                <button class="delete-participant-btn" title="Remove" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(participant)}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#c62828" viewBox="0 0 16 16">
                    <path d="M5.5 5.5v6m5-6v6m-7-8h10M2.5 4.5l1 9A1.5 1.5 0 0 0 5 15h6a1.5 1.5 0 0 0 1.5-1.5l1-9" stroke="#c62828" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  </svg>
                </button>
              </li>
            `).join("")
          : "<li class=\"no-participants\">No participants yet</li>";

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p class="participants-title">Participants:</p>
            <ul class="participants-list">
              ${participantsMarkup}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
        // Adiciona listeners para botões de exclusão
        setTimeout(() => {
          activityCard.querySelectorAll('.delete-participant-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              e.preventDefault();
              const activity = decodeURIComponent(btn.getAttribute('data-activity'));
              const email = decodeURIComponent(btn.getAttribute('data-email'));
              try {
                const resp = await fetch(`/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(email)}`, {
                  method: 'DELETE',
                });
                if (resp.ok) {
                  fetchActivities();
                } else {
                  const err = await resp.json();
                  alert(err.detail || 'Failed to remove participant');
                }
              } catch (err) {
                alert('Failed to remove participant');
              }
            });
          });
        }, 0);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
