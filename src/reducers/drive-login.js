const LOG_IN = 'scratch-gui/drive-login/LOG_IN';
const LOG_OUT = 'scratch-gui/drive-login/LOG_OUT';
const SET_GOOGLE_AUTH_INSTANCE = 'scratch-gui/drive-login/SET_GOOGLE_AUTH_INSTANCE';
const SET_GOOGLE_USER = 'scratch-gui/drive-login/SET_GOOGLE_USER';
const SET_PICKER_API_LOADED = 'scratch-gui/drive-login/SET_PICKER_API_LOADED';

const driveLoginInitialState = {
    signedIn: false,
    userName: '',
    googleAuth : null,
    googleUser : null,
    pickerApiLoaded : false
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = driveLoginInitialState;
    switch (action.type) {
    case LOG_IN:
        return Object.assign({}, state, {signedIn: true, userName: action.userName, googleUser : action.googleUser});
    case LOG_OUT:
        return Object.assign({}, state, {signedIn: false, userName: '', googleUser : null});
    case SET_GOOGLE_AUTH_INSTANCE:
        return Object.assign({}, state, {googleAuth: action.auth});
    case SET_GOOGLE_USER:
        return Object.assign({}, state, {googleUser: action.googleUser});
    case SET_PICKER_API_LOADED:
        return Object.assign({}, state, {pickerApiLoaded: true});
    default:
        return state;
    }
};

const logIn = (googleUser, userName) => ({type: LOG_IN, userName: userName, googleUser : googleUser});
const logOut = () => ({type: LOG_OUT});
const setAuthInstance = (auth) => ({type: SET_GOOGLE_AUTH_INSTANCE, auth : auth});
const setGoogleUser = (googleUser) => ({type: SET_GOOGLE_USER, googleUser : googleUser});
const setPickerApiLoaded = () => ({type: SET_PICKER_API_LOADED});

export {
    reducer as default,
    driveLoginInitialState,
    logIn,
    logOut,
    setAuthInstance,
    setGoogleUser,
    setPickerApiLoaded
};
