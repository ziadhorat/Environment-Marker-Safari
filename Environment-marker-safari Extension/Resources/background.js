function updateActiveTab() {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]) {
            checkEnvironment(tabs[0]);
        }
    });
}

function checkEnvironment(tab) {
    browser.storage.sync.get(['environments', 'markerSize']).then((result) => {
        const environments = result.environments || [];
        const url = new URL(tab.url);
        const matchedEnvs = environments.filter(env => {
            const urlConditions = env.url.split(',').map(u => u.trim());
            return urlConditions.every(condition => url.hostname.includes(condition));
        });

        if (matchedEnvs.length > 0) {
            browser.tabs.sendMessage(tab.id, {
                action: 'showEnvironmentMarkers',
                environments: matchedEnvs
            }).catch(() => {
                // If the content script hasn't loaded yet, inject it and try again
                browser.tabs.executeScript(tab.id, { file: 'content.js' })
                    .then(() => {
                        browser.tabs.sendMessage(tab.id, {
                            action: 'showEnvironmentMarkers',
                            environments: matchedEnvs
                        });
                    });
            });
        } else {
            browser.tabs.sendMessage(tab.id, { action: 'hideEnvironmentMarkers' })
                .catch(() => {
                    // If the content script hasn't loaded yet, we don't need to do anything
                });
        }
    });
}

// Listen for tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        checkEnvironment(tab);
    }
});

// Listen for tab activation
browser.tabs.onActivated.addListener((activeInfo) => {
    browser.tabs.get(activeInfo.tabId).then((tab) => {
        checkEnvironment(tab);
    });
});

// Listen for window focus changes
browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
        browser.tabs.query({ active: true, windowId: windowId }).then((tabs) => {
            if (tabs[0]) {
                checkEnvironment(tabs[0]);
            }
        });
    }
});

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.action === 'checkEnvironment') {
        checkEnvironment(sender.tab);
    }
});

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateEnvironments') {
        updateActiveTab();
    }
});

updateActiveTab();
