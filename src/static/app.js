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

      // Reset activity select options
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Current Participants:</strong>
            <ul class="participants-list"></ul>
          </div>
        `;

        // Build participants list with delete buttons
        const participantsUl = activityCard.querySelector('.participants-list');
        details.participants.forEach(p => {
          const li = document.createElement('li');
          li.className = 'participant-item';

          const span = document.createElement('span');
          span.textContent = p;

          const btn = document.createElement('button');
          btn.className = 'delete-btn';
          btn.title = 'Unregister participant';
          btn.innerHTML = '✖';
          btn.addEventListener('click', async () => {
            if (!confirm(`Unregister ${p} from ${name}?`)) return;
            try {
              const res = await fetch(`/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`, {
                method: 'DELETE'
              });
              const result = await res.json();
              if (res.ok) {
                showMessage(result.message, 'success');
                fetchActivities();
              } else {
                showMessage(result.detail || 'Failed to unregister', 'error');
              }
            } catch (err) {
              console.error('Error unregistering:', err);
              showMessage('Failed to unregister. Please try again.', 'error');
            }
          });

          li.appendChild(span);
          li.appendChild(btn);
          participantsUl.appendChild(li);
        });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
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
        showMessage(result.message, 'success');
        signupForm.reset();
        // Refresh activities list so the new participant appears immediately
        fetchActivities();
      } else {
        showMessage(result.detail || 'An error occurred', 'error');
      }
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 5000);
  }

  // Initialize app
  fetchActivities();
});
