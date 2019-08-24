const { ipcRenderer } = require('electron');

window.$ = window.jQuery = require('jquery');

var keyReady = -1;

/**
 * @type {NodeJS.Timeout}
 */
var timer;
var time = 0;
var kbhit = 0;

function resetTimer() {
    timer = null;
    kbhit = 0;
}

function setTimer() {
    if (timer)
        clearTimeout(timer)

    timer = setTimeout(() => {
        resetTimer();
    }, Number.parseFloat($('#timerdelay').val()) * 1000)
}

setInterval(() => {
    if (timer)
        time += 20;
    else
        time = 0;

    if (time != 0)
        $('#kps').text(Math.floor(kbhit / (time / 1000) * 10) / 10);
    else
        $('#kps').text('0');
}, 20)

function setCount(count) {
    unregisterAll();

    $('#keys').children().remove();
    $('#display').children().remove();


    for (let i = 0; i < count; i++) {
        let key = $('<div class="key"></div>');
        $('#keys').append(key);
        key.on('click', () => clickKey(i));

        let d_key = $('<div class="d-key"></div>');
        $('#display').append(d_key);
    }
}

function clickKey(index) {
    $('#keyready').addClass('active');
    keyReady = index;
}

$('#settingbtn').on('click', (e) => {
    $('#setting').addClass('active');
});

$('#closebtn').on('click', (e) => {
    $('#setting').removeClass('active');
});

$('#keycount').on('propertychange change keyup paste input', e => {
    setCount(Number.parseInt($('#keycount').val()));
})

$(document).on('keydown', (e) => {
    if (keyReady > -1) {
        var aleady = -1;
        $('#keys .key').each((i, element) => {
            if ($(element).text() == e.key) {
                aleady = i;
            }
        });

        if (aleady > -1) {
            unregister(aleady);
        }

        register(keyReady, e.key, e.keyCode);

        $('#keyready').removeClass('active');
        keyReady = -1;
    }
});

function register(index, key, keyCode) {
    $($('#keys .key')[index]).text(key);
    $($('#display .d-key')[index]).text(key);

    $($('#keys .key')[index]).addClass('registered');
    $($('#display .d-key')[index]).addClass('registered');

    ipcRenderer.send('register', { index: index, key: keyCode });
}

function unregister(index) {
    $($('#keys .key')[index]).text('');
    $($('#display .d-key')[index]).text('');

    $($('#keys .key')[index]).removeClass('registered');
    $($('#display .d-key')[index]).removeClass('registered');

    ipcRenderer.send('unregister', index);
}

function unregisterAll() {
    $('#keys .key').text('');
    ipcRenderer.send('unregisterAll', null);
}


ipcRenderer.on('keyDown', (event, arg) => {
    kbhit++;
    setTimer();

    $($('#keys .key')[arg]).addClass('pressed');
    $($('#display .d-key')[arg]).addClass('pressed');
})

ipcRenderer.on('keyUp', (event, arg) => {
    $($('#keys .key')[arg]).removeClass('pressed');
    $($('#display .d-key')[arg]).removeClass('pressed');
})