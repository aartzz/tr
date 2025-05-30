document.addEventListener('DOMContentLoaded', () => {
    const buttonContainer = document.getElementById('button-container');
    const mainPage = document.getElementById('main-page');
    const projectPage = document.getElementById('project-page');
    const projectContent = document.getElementById('project-content');
    const backButton = document.getElementById('back-button');

    async function fetchProjectsList() {
        try {
            const response = await fetch('data/projects_list.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Помилка завантаження списку проєктів:", error);
            return [];
        }
    }

    async function loadProjectDetails(dataFile) {
        try {
            const response = await fetch(dataFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            projectContent.innerHTML = `
                <h2>${data.title}</h2>
                <img src="${data.mainImage}" alt="${data.title}" style="max-width: 100%; border-radius: 5px; margin-bottom: 15px;">
                <p>${data.description}</p>
                ${data.screenshots ? `
                    <h3>Screenshots</h3>
                    <div class="screenshot-container">
                        ${data.screenshots.map(screenshot => `
                            <a href="${screenshot}" target="_blank" rel="noopener noreferrer">
                                <img src="${screenshot}" alt="Скріншот" class="screenshot">
                            </a>
                        `).join('')}
                    </div>
                ` : ''}
                ${data.youtubeVideos && data.youtubeVideos.length > 0 ? `
                    <h3>Video</h3>
                    <div class="youtube-videos-container">
                        ${data.youtubeVideos.map(videoId => `
                            <div class="youtube-video">
                                <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${data.downloads && data.downloads.length > 0 ? `
                    <h3>Downloads</h3>
                    <ul>
                        ${data.downloads.map(download => `
                            <li>
                                <img src="images/icons/${download.platform.toLowerCase().replace(/ /g, '_')}.png" alt="${download.platform}" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                                <a href="${download.link}" target="_blank">${download.filename}</a> (${download.size})
                                ${download.notes ? `[<span class="download-notes">${download.notes}</span>]` : ''}
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
            `;
        } catch (error) {
            console.error("Помилка завантаження даних проєкту:", error);
            projectContent.innerHTML = '<p>Виникла помилка при завантаженні даних проєкту.</p>';
        }
    }

    async function initializeButtons() {
        const projectsList = await fetchProjectsList();
        projectsList.forEach(project => {
            const button = document.createElement('div');
            button.classList.add('project-button');
            const img = document.createElement('img');
            img.src = project.image;
            img.alt = project.name;
            button.appendChild(img);
            button.addEventListener('click', () => {
                loadProjectDetails(project.dataFile);
                mainPage.classList.add('hidden');
                projectPage.classList.remove('hidden');
            });
            buttonContainer.appendChild(button);
        });
    }

    async function fetchLatestCommit() {
        try {
            const response = await fetch('https://api.github.com/repos/aartzz/tr/commits');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                const latestCommit = data[0].commit;
                const commitDateUTC = new Date(latestCommit.author.date);
                const localDate = commitDateUTC.toLocaleString(); // Локальна дата користувача
                const message = latestCommit.message;
                const element = document.getElementById('commit-info');
                element.textContent = `${localDate} || ${message}`;
            } else {
                document.getElementById('commit-info').textContent = 'Немає комітів.';
            }
        } catch (error) {
            console.error('Помилка при завантаженні комітів:', error);
            document.getElementById('commit-info').textContent = 'Не вдалося завантажити оновлення.';
        }
    }
    
    fetchLatestCommit();

    initializeButtons();

    backButton.addEventListener('click', () => {
        projectPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        projectContent.innerHTML = '';
    });
});