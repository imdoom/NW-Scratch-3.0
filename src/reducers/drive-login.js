const LOG_IN = 'scratch-gui/drive-login/LOG_IN';
const LOG_OUT = 'scratch-gui/drive-login/LOG_OUT';
const SET_GOOGLE_AUTH_INSTANCE = 'scratch-gui/drive-login/SET_GOOGLE_AUTH_INSTANCE';

const driveLoginInitialState = {
    signedIn: false,
    userName: '',
    googleAuth: null
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = driveLoginInitialState;
    switch (action.type) {
    case LOG_IN:
        return Object.assign({}, state, {signedIn: true, userName: action.user});
    case LOG_OUT:
        return Object.assign({}, state, {signedIn: false, userName: ''});
    case SET_GOOGLE_AUTH_INSTANCE:
        return Object.assign({}, state, {googleAuth: action.auth});
    default:
        return state;
    }
};

const logIn = user => ({type: LOG_IN, user: user});
const logOut = () => ({type: LOG_OUT});
const setAuthInstance = (auth) => ({type: SET_GOOGLE_AUTH_INSTANCE, auth : auth});

export {
    reducer as default,
    driveLoginInitialState,
    logIn,
    logOut,
    setAuthInstance
};
