document.addEventListener('DOMContentLoaded', () => {
    const environmentsDiv = document.getElementById('environments');
    const addButton = document.getElementById('addEnvironment');
    const saveButton = document.getElementById('save');
    const markerSizeInput = document.getElementById('markerSize');

    function createEnvironmentInput(env = {}) {
        const div = document.createElement('div');
        div.className = 'environment';
        div.innerHTML = `
            <button class="remove icon-button remove-button">-</button>
            <div class="environment-row">
                <input type="text" class="name" placeholder="Name" value="${env.name || ''}">
                <input type="color" class="color" value="${env.color || '#FF0000'}">
            </div>
            <div class="environment-row">
                <input type="text" class="url" placeholder="URL" value="${env.url || ''}">
                <select class="position">
                    <option value="top-left" ${env.position === 'top-left' ? 'selected' : ''}>Top Left</option>
                    <option value="top-right" ${env.position === 'top-right' ? 'selected' : ''}>Top Right</option>
                    <option value="bottom-left" ${env.position === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
                    <option value="bottom-right" ${env.position === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
                </select>
            </div>
        `;
        div.querySelector('.remove').addEventListener('click', () => div.remove());
        return div;
    }

    function loadEnvironments() {
        browser.storage.sync.get('environments').then((result) => {
            const environments = result.environments || [];
            environmentsDiv.innerHTML = ''; // Clear existing environments
            environments.forEach(env => {
                environmentsDiv.appendChild(createEnvironmentInput(env));
            });
        });
    }

    addButton.addEventListener('click', () => {
        environmentsDiv.appendChild(createEnvironmentInput());
    });

    function saveSettings() {
        const environments = Array.from(environmentsDiv.children).map(div => ({
            name: div.querySelector('.name').value,
            url: div.querySelector('.url').value,
            color: div.querySelector('.color').value,
            position: div.querySelector('.position').value
        }));
        const markerSize = parseInt(markerSizeInput.value, 10);
        browser.storage.sync.set({ environments, markerSize }).then(() => {
            alert('Settings saved!');
            browser.runtime.sendMessage({ action: 'updateEnvironments' });
        });
    }

    saveButton.addEventListener('click', saveSettings);

    loadEnvironments();

    // Load saved marker size
    browser.storage.sync.get('markerSize').then((result) => {
        document.getElementById('markerSize').value = result.markerSize || 50;
    });
});
