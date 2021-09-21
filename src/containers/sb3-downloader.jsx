import bindAll from 'lodash.bindall';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';
import {logIn,
        logOut,
        setAuthInstance,
        setGoogleUser,
        setPickerApiLoaded} from '../reducers/drive-login';
import {MenuItem} from '../components/menu/menu.jsx';
import downloadBlob from '../lib/download-blob';
import { gapi } from 'gapi-script';

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const appId = "28777473097";
const apiKey = "AIzaSyACUh3Wedl4ofcS86i8Q8tvDFSQQPoRTGE";
const clientId = "28777473097-vi5cnuplfdl680ab8p93htss35s107tn.apps.googleusercontent.com";
const googleJsClientApi = "https://apis.google.com/js/api.js";

class DriveUploadBlob extends React.Component {
    constructor (props) {   
        super(props);
        bindAll(this, [
            'downloadProject'
        ]);
    }
    componentDidMount() {
        console.log('component did mount');
        let script = document.createElement('script');
        script.src = googleJsClientApi;
        script.onload = () => {
            gapi.load('client:auth2', this.initClient);
            gapi.load('picker', this.props.onPickerLoad);
        } 
        document.body.appendChild(script);
    }
    

    initClient = () => {
        try {
          gapi.client.init({
              'apiKey': apiKey,
              'clientId': clientId,
              'scope': SCOPE,
              'discoveryDocs': [discoveryUrl]
            }).then(() => {
                console.log('gapi client initialized');
                this.props.onAuthInstance(gapi.auth2.getAuthInstance());
                this.props.googleAuth.isSignedIn.listen(this.setSigninStatus);
                this.setSigninStatus();
          });
        } catch(e) {
          console.log(e);
        }
    }

    setSigninStatus = () => {
        var googleUser = null || this.props.googleAuth.currentUser.get();
        console.log(googleUser);
        console.log('signed-in: '+googleUser.isSignedIn());
        if (googleUser && googleUser.isSignedIn()) {
            this.props.onDriveLogIn(googleUser, googleUser.wt.Ad);            
        } else {
            this.props.onDriveLogOut();
        }
    }

    signInFunction = () => {
        this.props.googleAuth.signIn();
    }
    
    signOutFunction = () => {
        this.props.googleAuth.signOut();
    }

    saveToDrive = () => {
        var googleUser = null || this.props.googleAuth.currentUser.get();
        var isAuthorized = googleUser.hasGrantedScopes(SCOPE);
        if (googleUser && isAuthorized) {
            console.log(this.props.googleUser);
            this.props.saveProjectSb3().then(content => {
                var fileName = prompt("Please enter the file name", "My Scratch Project");
                var metadata = {
                    'name': fileName+'.sb3',
                    'mimeType': content.type
                    //'parents': ['Scratch'], // Folder ID at Google Drive
                };                
                var accessToken = googleUser.xc.access_token // Here gapi is used for retrieving the access token.
                var form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
                form.append('file', content);
        
                var xhr = new XMLHttpRequest();
                xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                xhr.responseType = 'json';
                xhr.onload = () => {
                    console.log(xhr.response.id); // Retrieve uploaded file ID.
                };
                xhr.send(form);
            });   
        }
    }

    googlePicker = () => {
        var googleUser = null || this.props.googleAuth.currentUser.get();
        if (this.props.pickerApiLoaded && googleUser) {
            var view = new google.picker.View(google.picker.ViewId.DOCS);
            view.setMimeTypes("application/x.scratch.sb3");
            var picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                .setAppId(appId)
                .setOAuthToken(googleUser.xc.access_token)
                .addView(view)
                .addView(new google.picker.DocsUploadView())
                .setDeveloperKey(apiKey)
                .setCallback(this.pickerCallback)
                .setOrigin(window.location.protocol + '//' + window.location.host)
                .build();
             picker.setVisible(true);
        }
    }

    pickerCallback = (data) => {
        if (data.action == google.picker.Action.PICKED) {
            var fileId = data.docs[0].id;
            alert('The user selected: ' + fileId);
        }
    }


    getProjectFilename = (curTitle=this.props.projectTitle, defaultTitle=projectTitleInitialState) => {
        let filenameTitle = curTitle;
        if (!filenameTitle || filenameTitle.length === 0) {
            filenameTitle = defaultTitle;
        }
        return `${filenameTitle.substring(0, 100)}.sb3`;
    };

    downloadProject () {
        this.props.saveProjectSb3().then(content => {
            downloadBlob(this.getProjectFilename(), content);
        });
    }
    render () {
        return (
            <>
                {!this.props.signedIn && 
                    <MenuItem id="signin-btn" onClick={this.signInFunction}>
                        Sign-In
                    </MenuItem>}
                {this.props.signedIn && 
                    <MenuItem id="signout-btn" onClick={this.signOutFunction}>
                        Sign-Out
                    </MenuItem>}
                <MenuItem
                    onClick={this.saveToDrive}
                >
                    Save to drive
                </MenuItem>
                <MenuItem
                    onClick={this.downloadProject}
                    id={"savetodrive-div"}
                >
                    Save to your computer
                </MenuItem>
                <MenuItem
                    onClick={this.googlePicker}
                    id={"loadfromdrive-div"}
                >
                    Load from drive
                </MenuItem>
            </>
        )
    }
}

const mapStateToProps = state => ({
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
    projectTitle: state.scratchGui.projectTitle,
    googleAuth : state.scratchGui.driveLogin.googleAuth,
    userName : state.scratchGui.driveLogin.userName,
    signedIn : state.scratchGui.driveLogin.signedIn,
    googleUser : state.scratchGui.driveLogin.googleUser,
    pickerApiLoaded : state.scratchGui.driveLogin.pickerApiLoaded
});

const mapDispatchToProps = dispatch => ({
    onDriveLogIn : (googleUser, userName) => dispatch(logIn(googleUser, userName)),
    onDriveLogOut : () => dispatch(logOut()),
    onAuthInstance : (auth) => dispatch(setAuthInstance(auth)),
    onGoogleUser : (googleUser) => dispatch(setGoogleUser(googleUser)),
    onPickerLoad : () => dispatch(setPickerApiLoaded())
});

export default connect(mapStateToProps, mapDispatchToProps)(DriveUploadBlob);