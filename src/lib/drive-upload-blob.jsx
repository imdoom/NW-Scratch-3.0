import bindAll from 'lodash.bindall';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';
import {MenuItem} from '../components/menu/menu.jsx';
import downloadBlob from './download-blob';
import { gapi } from 'gapi-script';

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

class DriveUploadBlob extends React.Component {
    constructor (props) {   
        super(props);
        bindAll(this, [
            'downloadProject'
        ]);
        this.state = ({
            signedIn : false,
            name: '',
            googleAuth: null
        })
    }
    componentDidMount() {
        let script = document.createElement('script');
        script.onload = gapi.load('client:auth2', this.initClient);
        script.src="https://apis.google.com/js/api.js";
        document.body.appendChild(script);
    }

    initClient = () => {
        try {
          gapi.client.init({
              'apiKey': "AIzaSyACUh3Wedl4ofcS86i8Q8tvDFSQQPoRTGE",
              'clientId': "28777473097-vi5cnuplfdl680ab8p93htss35s107tn.apps.googleusercontent.com",
              'scope': SCOPE,
              'discoveryDocs': [discoveryUrl]
            }).then(() => {
                console.log('boo yah');
                this.setState((state) => {
                    return {
                        ...state,
                        googleAuth: gapi.auth2.getAuthInstance()
                    }
                });
                this.state.googleAuth.isSignedIn.listen(this.setSigninStatus);    
          });
        } catch(e) {
          console.log(e);
        }
    }

    signInFunction = () => {
        this.state.googleAuth.signIn();
        this.setSigninStatus()
    }
    
    signOutFunction = () => {
        this.state.googleAuth.signOut();
        this.setSigninStatus()
    }
    
    setSigninStatus = () => {
        var googleUser = null || this.state.googleAuth.currentUser.get();
        console.log(googleUser);
        if (googleUser.isSignedIn()) {
            this.setState((state) => {
                return {
                    ...state,
                    signedIn: true,
                    name: googleUser.wt.Ad
                }
            });
            var isAuthorized = googleUser.hasGrantedScopes(SCOPE);
            if (isAuthorized) {                
                alert('authorised by ', this.state.name);
                // const boundary='foo_bar_baz'
                // const delimiter = "\r\n--" + boundary + "\r\n";
                // const close_delim = "\r\n--" + boundary + "--";
                // var fileName='mychat123';
                // var fileData='this is a sample data';
                // var contentType='text/plain'
                // var metadata = {
                //   'name': fileName,
                //   'mimeType': contentType
                // };
        
                // var multipartRequestBody =
                //   delimiter +
                //   'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                //   JSON.stringify(metadata) +
                //   delimiter +
                //   'Content-Type: ' + contentType + '\r\n\r\n' +
                //   fileData+'\r\n'+
                //   close_delim;
        
                //   console.log(multipartRequestBody);
                //   var request = window.gapi.client.request({
                //     'path': 'https://www.googleapis.com/upload/drive/v3/files',
                //     'method': 'POST',
                //     'params': {'uploadType': 'multipart'},
                //     'headers': {
                //       'Content-Type': 'multipart/related; boundary=' + boundary + ''
                //     },
                //     'body': multipartRequestBody});
                // request.execute(function(file) {
                //   console.log(file)
                // });
            }
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
            if (this.props.onSaveFinished) {
                console.log('done');
                this.props.onSaveFinished();
            }
            downloadBlob(this.getProjectFilename(), content);
            //driveUploadBlob(this.props.projectFilename, content);
        });
    }
    render () {
        return (
            <>
            <MenuItem>
                UserName: {this.state.name}
            </MenuItem>
            {this.state.signedIn && <MenuItem id="signin-btn" onClick={this.signInFunction}>
                Sign-In
            </MenuItem>}
            <MenuItem id="signout-btn" onClick={this.signOutFunction}>
                Sign-Out
            </MenuItem>
            <MenuItem
                onClick={this.downloadProject}
            >
            Save to your computer
            </MenuItem>
            </>
        )
    }
}

const mapStateToProps = state => ({
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
    projectTitle: state.scratchGui.projectTitle
});

export default connect(mapStateToProps)(DriveUploadBlob);

// SB3Downloader.propTypes = {
//     onSaveFinished: PropTypes.func,
//     projectFilename: PropTypes.string,
//     saveProjectSb3: PropTypes.func
// };
// SB3Downloader.defaultProps = {
//     className: ''
// };

/**
 * Project saver component passes a downloadProject function to its child.
 * It expects this child to be a function with the signature
 *     function (downloadProject, props) {}
 * The component can then be used to attach project saving functionality
 * to any other component:
 *
 * <SB3Downloader>{(downloadProject, props) => (
 *     <MyCoolComponent
 *         onClick={downloadProject}
 *         {...props}
 *     />
 * )}</SB3Downloader>
 */