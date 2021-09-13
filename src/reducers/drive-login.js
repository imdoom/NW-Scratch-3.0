const DRIVE_LOG_IN = 'scratch-gui/login/DRIVE_LOG_IN';
const DRIVE_LOG_OUT = 'scratch-gui/login/DRIVE_LOG_OUT';

const initialState = {
    driveLoggedIn: false,
    driveUserName: ''
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case DRIVE_LOG_IN:
        return Object.assign({}, state, {driveLoggedIn: true, driveUserName: action.user});
    case DRIVE_LOG_OUT:
        return Object.assign({}, state, {driveLoggedIn: false, driveUserName: action.user});
    default:
        return state;
    }
};

const logIn = user => ({type: DRIVE_LOG_IN, user: user});
const logOut = () => ({type: DRIVE_LOG_OUT, user: ''});

export {
    reducer as default,
    logIn,
    logOut
};
