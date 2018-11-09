import React, { Component } from "react";
import { connect } from "react-redux";
import { setColors } from "../../actions";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment,
  Grid
} from "semantic-ui-react";
import { SketchPicker } from "react-color";
import firebase from "../../firebase";

class ColorPanel extends Component {
  state = {
    modal: false,
    primaryColor: "#4c3c4c",
    secondaryColor: "#EEEEEE",
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    userColors: []
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }
  componentWillUnmount() {
    this.removeListeners();
  }
  removeListeners = () => {
    this.state.usersRef.child(`${this.state.user.uid}/colors`).off();
  };

  addListener = userId => {
    let userColors = [];
    this.state.usersRef.child(`${userId}/colors`).on("child_added", snap => {
      userColors.unshift({ ...snap.val(), key: snap.key });
      this.setState({ userColors });
    });

    this.state.usersRef.child(userId).on("value", snap => {
      if (snap.val() && snap.val().primaryColor) {
        this.setState(
          {
            primary: snap.val().primaryColor,
            secondary: snap.val().secondaryColor
          },
          () => {
            this.props.setColors(
              snap.val().primaryColor,
              snap.val().secondaryColor
            );
          }
        );
      }
    });

    this.state.usersRef.child(`${userId}/colors`).on("child_removed", snap => {
      const newColors = this.state.userColors.filter(
        color => color.key !== snap.key
      );
      this.setState({ userColors: newColors }, () => {
        if (this.state.userColors.length === 0) {
          this.setState(
            {
              primary: "#4c3c4c",
              secondary: "#EEEEEE"
            },
            () => {
              this.handleChooseColor({
                primary: "#4c3c4c",
                secondary: "#EEEEEE"
              });
            }
          );
        }
      });
    });
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  handleChangePrimary = color => this.setState({ primary: color.hex });
  handleChangeSecondary = color => this.setState({ secondary: color.hex });
  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors(this.state.primary, this.state.secondary);
    }
  };
  handleChooseColor = ({ primary, secondary }) => {
    this.props.setColors(primary, secondary);
    this.state.usersRef.child(this.state.user.uid).update({
      primaryColor: primary,
      secondaryColor: secondary
    });
  };

  saveColors = (primary, secondary) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primary,
        secondary
      })
      .then(() => {
        this.closeModal();
      })
      .catch(err => console.error(err));
  };
  removeColor = key => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .child(key)
      .remove(err => {
        if (err) console.error(err);
      });
  };
  displayUserColors = colors =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <Icon
          className="color__remove"
          size="small"
          name="remove"
          color="red"
          onClick={() => this.removeColor(color.key)}
        />
        <div
          className="color__container"
          style={{ marginTop: "-2px" }}
          onClick={() => this.handleChooseColor(color)}
        >
          <div className="color__square" style={{ background: color.primary }}>
            <div
              className="color__overlay"
              style={{ background: color.secondary }}
            />
          </div>
        </div>
      </React.Fragment>
    ));

  render() {
    const { modal, primary, secondary, userColors } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
        className="color__panel"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColors(userColors)}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Grid centered columns="equal">
              <Grid.Column width={8}>
                <Segment inverted>
                  <Label content="Primary Color" />
                  <SketchPicker
                    color={primary}
                    onChange={this.handleChangePrimary}
                  />
                </Segment>
              </Grid.Column>
              <Grid.Column width={8}>
                <Segment inverted>
                  <Label content="Secondary Color" />
                  <SketchPicker
                    color={secondary}
                    onChange={this.handleChangeSecondary}
                  />
                </Segment>
              </Grid.Column>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colors
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(
  null,
  { setColors }
)(ColorPanel);
