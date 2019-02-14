import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';

import Colors from '../../styles/colors';
import commonStyles from '../../styles/commonStyles';
import ImageCropModal from '../../containers/dashboard/components/image_crop_modal';

export default class ImageS3Uploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageURL: '',
      fileUploaded: false,
      modalOpen: false,
      fileCropped: false,
    };

    this.fileInputRef = null;
    this.currentImageRef = null;
    this.visibleFileInputRef = null;
  }

  componentDidMount() {
    // const _input = document.getElementById('upload_hidden_cover');
    // _input.addEventListener('change', (e) => {
    //     console.log('>>>>>>>>>>PATH', e);
    // });
  }

  _uploadToAws(file) {
    const { cb, fileName } = this.props;
    const _self = this;
    let data = new FormData();
    const splittedFileName = file.type.split('/');
    const ext = splittedFileName[splittedFileName.length - 1];
    data.append('file', file, `${fileName}-${moment().format('x')}.${ext}`);
    axios
      .post('/api/upload', data)
      .then(function(res) {
        // POST succeeded...
        console.log('success upload to aws s3: ', res);
        //replace 'http' with 'https'
        let url = res.data[0].url;
        if (url.slice(0, 5) !== 'https') {
          url = url.replace(/http/i, 'https');
        }
        _self.setState({ imageURL: url });
        cb(url);
      })
      .catch(function(err) {
        // POST failed...
        console.log('ERROR upload to aws s3: ', err);
      });
  }

  setFileName(e) {
    // this._uploadToAws(this.fileInputRef.files[0])
    if (this.fileInputRef.files[0]) {
      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (allowedFileTypes.indexOf(this.fileInputRef.files[0].type) < 0) {
        alert('Only .png or .jpeg files are accepted. Please upload a new file.');
        this.setState({ fileUploaded: false });
        return;
      }
      this.setState({ fileUploaded: true });
      this.currentImageRef = this.fileInputRef.files[0];
      this.handleModalOpen();
    }
  }

  handleModalOpen() {
    this.setState({
      modalOpen: true,
      fileCropped: false,
    });
  }

  handleModalClose() {
    this.setState({
      modalOpen: false,
      fileUploaded: false,
    });
    document.getElementById('upload_hidden_cover').value = null;
  }

  uploadViaModal(fileBlob, hostImg) {
    this.setState({
      fileCropped: true,
      modalOpen: false,
      fileUploaded: true,
    });
    this._uploadToAws(fileBlob, hostImg);
  }

  render() {
    const { imageURL, fileUploaded, modalOpen } = this.state;
    const that = this;

    return (
      <div style={_styles.fileUploader}>
        <ImageCropModal
          open={modalOpen}
          handleClose={this.handleModalClose.bind(this)}
          upload={this.uploadViaModal.bind(this)}
          hostImg={false}
          file={this.currentImageRef}
        />
        <div style={_styles.image}>
          {(this.fileInputRef && this.fileInputRef.files && this.fileInputRef.files[0] && (
            <img src={imageURL} />
          )) ||
            null}
        </div>
        <div style={_styles.loaderWrapper}>
          <span style={{ ..._styles.titleText, marginLeft: 10 }}>{this.props.title}</span>
          <div style={{ ..._styles.inputFileWrapper, marginTop: 0 }}>
            <input
              type="file"
              name="upload"
              accept="image/*"
              id="upload_hidden_cover"
              onChange={this.setFileName.bind(this)}
              style={_styles.inputFileHidden}
              ref={input => (this.fileInputRef = input)}
            />
            {(fileUploaded && (
              <div>
                <span>{this.fileInputRef.files[0].name}</span>
                <span
                  style={_styles.cancelImg}
                  onClick={() => that.setState({ fileUploaded: false, imageURL: '' })}
                >
                  Cancel
                </span>
              </div>
            )) ||
              (!fileUploaded && (
                <div>
                  <button
                    onClick={() => {
                      document.getElementById('upload_hidden_cover').click();
                    }}
                    style={{
                      ..._styles.uploadButton,
                      backgroundColor: Colors.mainOrange,
                    }}
                  >
                    Upload
                  </button>
                  <span style={_styles.fileTypesLabel}>.jpg or .png files accepted</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
}

ImageS3Uploader.propTypes = {
  cb: PropTypes.func,
  fileName: PropTypes.string,
};

const _styles = {
  inputFileHidden: { ...commonStyles.inputFileHidden },
  loaderWrapper: {
    ...commonStyles.loaderWrapper,
    height: 143,
    width: 'calc(100% - 133px)',
    float: 'left',
  },
  image: { ...commonStyles.image, float: 'left' },
  cancelImg: { ...commonStyles.cancelImg, fontSize: 14 },
  fileUploader: { height: 133 },
  titleText: { fontSize: 14 },
  inputFileWrapper: {
    margin: 10,
    width: 'calc(100% - 20px)',
    height: 53,
    backgroundColor: Colors.mainWhite,
    overflow: 'hidden',
    marginBottom: 0,
    float: 'left',
  },
  uploadButton: {
    backgroundColor: Colors.mainOrange,
    width: 70,
    height: 32,
    color: Colors.mainWhite,
    fontSize: 12,
    border: 0,
  },
  fileTypesLabel: {
    fontSize: 11,
    marginLeft: 0,
    display: 'block',
  },
};
