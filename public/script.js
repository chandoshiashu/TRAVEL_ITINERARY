document.getElementById('generate-btn').addEventListener('click', () => {
    const city = document.getElementById('city-select').value;
    const duration = parseInt(document.getElementById('duration-input').value);
    const persona = document.getElementById('persona-select').value;

    const resultContainer = document.getElementById('result-container');
    const weatherText = document.getElementById('report-weather');
    const transitText = document.getElementById('report-transit');
    const timelineGrid = document.getElementById('itinerary-timeline');

    // Make network request to backend engine
    fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, duration, persona })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) return alert(data.error);

        // Make response layout container visible
        resultContainer.classList.remove('hidden');

        // Render high-level intelligence reports
        weatherText.innerText = `🌦️ Current Weather: ${data.weather}`;
        transitText.innerText = data.transitStatus;

        // Clear any old schedules drawn previously
        timelineGrid.innerHTML = '';

        // Draw day nodes dynamically
        Object.keys(data.schedule).forEach(day => {
            const activities = data.schedule[day];
            
            // Build card element frame
            const dayCard = document.createElement('div');
            dayCard.className = "bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-md";

            // If no attractions passed filters
            let activitiesHTML = `<p class="text-rose-400 text-sm italic">No compatible matches found for this persona due to weather constraints.</p>`;

            if (activities.length > 0) {
                activitiesHTML = `<ul class="space-y-2">`;
                activities.forEach(act => {
                    activitiesHTML += `
                        <li class="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-700/50">
                            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                            <span class="text-slate-200 font-medium">${act}</span>
                        </li>`;
                });
                activitiesHTML += `</ul>`;
            }

            dayCard.innerHTML = `
                <h3 class="text-xl font-bold text-cyan-400 mb-3 border-b border-slate-700 pb-2">${day}</h3>
                ${activitiesHTML}
            `;

            timelineGrid.appendChild(dayCard);
        });
    })
    .catch(err => console.error("Pipeline failure:", err));
});