// implement click handler #google-login-btn

document.getElementById('google-login-btn').addEventListener('click', function () {
    gapiAuthService.login().then(function () {
        // use token
        localStorage.loggedIn = true;
    }, function (err) {
        // handle error
        localStorage.loggedIn = false;
        console.err(err)
    })
})