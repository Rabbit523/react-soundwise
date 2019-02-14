import React, { Component } from 'react';
import ReactS3Uploader from 'react-s3-uploader';
import LinearProgress from 'material-ui/LinearProgress';
import Dots from 'react-activity/lib/Dots';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default class S3FileUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fileUploading: false,
      fileUploaded: props.showUploadedFile ? true : false,
      fileName: props.showUploadedFile || '',
      fileUploadProgress: 0,
      fileUploadError: null,
      // fileUrl: '',
    };
  }

  clearInputFile(f) {
    if (f.value) {
      try {
        f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
      } catch (err) {}
      if (f.value) {
        //for IE5 ~ IE10
        var form = document.createElement('form'),
          parentNode = f.parentNode,
          ref = f.nextSibling;
        form.appendChild(f);
        form.reset();
        parentNode.insertBefore(f, ref);
      }
    }
  }

  preProcess(file, next) {
    // this.props.onPreProcessCallback && this.props.onPreProcessCallback(file);
    this.clearInputFile(this.uploadFileInput);
    this.setState({
      fileName: file.name,
      fileUploading: true,
    });
    next(file);
  }

  onProgress(percent, message) {
    this.setState({
      fileUploadProgress: percent,
    });
  }

  onFinish(signResult) {
    const awsUrl = signResult.signedUrl.split('?')[0];
    const aux = awsUrl.split('.');
    const ext = aux[aux.length - 1];
    this.setState({
      fileUploading: false,
      fileUploaded: true,
      fileUploadProgress: 0,
      // uploadedFileUrl
    });
    this.props.onUploadedCallback && this.props.onUploadedCallback(ext);
  }

  onError(message) {
    console.log(`upload error ${this.props.s3NewFileName}: ` + message);
    this.setState({ fileUploadError: message });
  }

  render() {
    const {
      fileUploading,
      fileUploaded,
      fileUploadProgress,
      fileUploadError,
      /* uploadedFileUrl, */ fileName,
    } = this.state;
    return (
      <div style={{ display: 'inline-block' }}>
        <div style={{ display: 'none' }}>
          <ReactS3Uploader
            signingUrl="/s3/sign"
            signingUrlMethod="GET"
            accept=".mp3,.m4a"
            preprocess={this.preProcess.bind(this)}
            onProgress={this.onProgress.bind(this)}
            onError={this.onError.bind(this)}
            onFinish={this.onFinish.bind(this)}
            uploadRequestHeaders={{ 'x-amz-acl': 'public-read' }}
            contentDisposition="auto"
            scrubFilename={filename => {
              const original = filename.split('.');
              const ext = original[original.length - 1];
              return filename.replace(filename.slice(0), `${this.props.s3NewFileName}.${ext}`);
            }}
            inputRef={cmp => (this.uploadFileInput = cmp)}
            autoUpload={true}
          />
        </div>
        {(fileUploading && (
          <div>
            {(fileUploadError && (
              <div>
                <span style={{ color: 'red' }}>{fileUploadError}</span>
              </div>
            )) || (
              <div>
                <div style={{ textAlign: 'center', display: 'none' }}>
                  <div className="title-small" style={{ marginBottom: 5 }}>
                    {`Uploading audio file`}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Dots style={{}} color="#727981" size={22} speed={1} />
                  </div>
                </div>
                <div style={{ display: '' }}>
                  <MuiThemeProvider>
                    <LinearProgress
                      mode="determinate"
                      value={fileUploadProgress}
                      color={Colors.mainOrange}
                    />
                  </MuiThemeProvider>
                  <div className="text-medium" style={{ textAlign: 'center' }}>
                    <span>{`uploading ${fileUploadProgress} %`}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )) ||
          (fileUploaded && (
            <div style={{ textAlign: 'center' }}>
              <div className="text-medium">{`${fileName} saved`}</div>
              <div
                style={styles.cancelImg}
                onClick={() => {
                  this.props.onRemoveCallback && this.props.onRemoveCallback();
                  this.setState({ fileUploaded: false, uploadedFileUrl: '' });
                }}
              >
                Cancel
              </div>
            </div>
          )) ||
          (!fileUploaded && (
            <button
              onClick={() => {
                this.uploadFileInput.click();
              }}
              style={{
                ...styles.uploadButton,
                backgroundColor: Colors.mainOrange,
              }}
            >
              Upload
            </button>
          ))}
      </div>
    );
  }
}

const styles = {
  cancelImg: { ...commonStyles.cancelImg },
  uploadButton: {
    backgroundColor: Colors.link,
    width: 80,
    height: 30,
    // float: 'left',
    color: Colors.mainWhite,
    fontSize: 18,
    border: 0,
    marginTop: 5,
  },
};
