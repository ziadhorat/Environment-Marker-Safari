let markers = [];
let moveTimeouts = {};

function showEnvironmentMarkers(environments, size) {
    hideEnvironmentMarkers(); // Clear existing markers

    environments.forEach((env, index) => {
        const marker = createMarker(env, size, index);
        positionMarker(marker, env.position, index);
        document.body.appendChild(marker);
        markers.push(marker);

        setupMarkerEventListeners(marker, env.position, index);
    });
}

function createMarker(environment, size, index) {
    const marker = document.createElement('div');
    marker.style.position = 'fixed';
    marker.style.zIndex = `${9999 - index}`; // Ensure proper stacking
    marker.style.backgroundColor = environment.color;
    marker.style.color = 'white';
    marker.style.padding = '5px 10px';
    marker.style.fontFamily = 'Arial, sans-serif';
    marker.style.fontSize = `${size / 4}px`;
    marker.style.display = 'inline-block';
    marker.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    marker.style.borderRadius = '4px';
    marker.style.transition = 'all 0.5s ease';
    marker.textContent = environment.name;
    marker.dataset.index = index;
    return marker;
}

function positionMarker(marker, position, index) {
    const baseOffset = 10;
    const markerHeight = 30; // Approximate height, adjust as needed
    const spacing = 5; // Space between markers

    const positions = {
        'top-left': { top: `${baseOffset + index * (markerHeight + spacing)}px`, left: `${baseOffset}px`, right: 'auto', bottom: 'auto' },
        'top-right': { top: `${baseOffset + index * (markerHeight + spacing)}px`, right: `${baseOffset}px`, left: 'auto', bottom: 'auto' },
        'bottom-left': { bottom: `${baseOffset + index * (markerHeight + spacing)}px`, left: `${baseOffset}px`, top: 'auto', right: 'auto' },
        'bottom-right': { bottom: `${baseOffset + index * (markerHeight + spacing)}px`, right: `${baseOffset}px`, top: 'auto', left: 'auto' }
    };

    Object.assign(marker.style, positions[position]);
}

function setupMarkerEventListeners(marker, position, index) {
    marker.addEventListener('mouseenter', () => {
        clearTimeout(moveTimeouts[index]);
        moveTimeouts[index] = setTimeout(() => {
            moveToOppositeCorner(marker, position, index);
        }, 300);
    });

    marker.addEventListener('mouseleave', () => {
        clearTimeout(moveTimeouts[index]);
        moveTimeouts[index] = setTimeout(() => {
            positionMarker(marker, position, index);
        }, 300);
    });
}

function moveToOppositeCorner(marker, position, index) {
    const oppositePositions = {
        'top-left': 'top-right',
        'top-right': 'top-left',
        'bottom-left': 'bottom-right',
        'bottom-right': 'bottom-left'
    };

    positionMarker(marker, oppositePositions[position], index);
}

function hideEnvironmentMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
    moveTimeouts = {};
}

function initializeMarkers(message) {
    browser.storage.sync.get('markerSize').then((result) => {
        const markerSize = result.markerSize || 30;
        showEnvironmentMarkers(message.environments, markerSize);
    });
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'showEnvironmentMarkers') {
        initializeMarkers(message);
    } else if (message.action === 'hideEnvironmentMarkers') {
        hideEnvironmentMarkers();
    }
});

// Check if we should show the markers on page load
browser.runtime.sendMessage({ action: 'checkEnvironment', url: window.location.href });
