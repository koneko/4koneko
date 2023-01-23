window.gapiCallbacks = [];
function gapiLoaded () {
    gapi.auth.init(function () {
        var GapiQueue = function () {
            this.push = function (callback) {
                setTimeout(callback, 0);
            };
        };
        var _old_gapiCallbacks = window.gapiCallbacks;
        window.gapiCallbacks = new GapiQueue();
        _old_gapiCallbacks.forEach(function (callback) {
            window.gapiCallbacks.push(callback);
        });
    });
}
function isTokenNeedsRefresh (token) {
    return (
        !token ||
        moment
            .duration(
                moment(token.expires_at * 1000).valueOf() - moment().valueOf()
            )
            .minutes() < 10
    );
}
function getConfig () {
    return {
        'client_id': "93244823761-016l556dsqs2qfrb5c2dn1pdpu29kvq5.apps.googleusercontent.com",
        'scope': "https://www.googleapis.com/auth/drive",
        'immediate': true
    }
}
// code from https://advancedweb.hu/using-google-auth-in-javascript/, please convert to not using $q
function checkLogin () {
    // rewrite to use promises
    return new Promise(function (resolve, reject) {
        var config = getConfig();
        gapi.auth.authorize(config, function (token) {
            if (token && !token.error) {
                resolve(token);
            } else {
                reject(token);
            }
        });
    })
}

gapiAuthService.checkLogin().then(function () {
    // instead of scope, use localstorage
    localStorage.loggedIn = true;
}, function () {
    localStorage.loggedIn = false;
})

function login () {
    // same as article, just as a promise
    return new Promise(function (resolve, reject) {
        var config = getConfig();
        config.immediate = false;
        gapi.auth.authorize(config, function (token) {
            if (token && !token.error) {
                resolve(gapi.auth.getToken().access_token);
            } else {
                reject(token);
            }
        });
    })
}

function createFolder (name) {
    return gapi.client.drive.files.insert(
        {
            'resource': {
                "title": name,
                "mimeType": "application/vnd.google-apps.folder"
            }
        }
    )
}

function ensureUploadFolderPresent () {
    return gapi.client.drive.files.list(
        { q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false" }
    ).then(function (files) {
        var directory = files.result.items;

        if (!directory.length) {
            return createFolder("4koneko").then(function (res) {
                return res.result;
            });
        } else {
            return directory[0];
        }
    });
}