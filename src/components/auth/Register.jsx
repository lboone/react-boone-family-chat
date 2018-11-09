import React, { Component } from "react";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import firebase from "../../firebase";
import md5 from "md5";

class Register extends Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    loading: false,
    errors: [],
    messages: [],
    usersRef: firebase.database().ref("users")
  };
  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty()) {
      let message = "The following fields are empty: ";
      message =
        this.state.username.length === 0
          ? message.concat("Username ")
          : message;
      message =
        this.state.email.length === 0 ? message.concat("Email ") : message;
      message =
        this.state.password.length === 0
          ? message.concat("Password ")
          : message;
      message =
        this.state.passwordConfirmation.length === 0
          ? message.concat("PasswordConfirmation ")
          : message;
      error = {
        message
      };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (this.isPasswordInValid()) {
      error = {
        message:
          "Password must be greater than 5 characters and passwords must match"
      };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      // form valid
      return true;
    }
  };

  isFormEmpty = () => {
    const { username, email, password, passwordConfirmation } = this.state;
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };
  isPasswordInValid = () => {
    const { password, passwordConfirmation } = this.state;
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return true;
    } else if (password !== passwordConfirmation) {
      return true;
    } else {
      return false;
    }
  };

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  displayMessages = messages =>
    messages.map((message, i) => <p key={i}>{message.message}</p>);

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `https://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              this.saveUser(createdUser).then(() => {
                this.setState({
                  username: "",
                  email: "",
                  password: "",
                  passwordConfirmation: "",
                  loading: false,
                  messages: this.state.messages.concat({
                    message: "You are now registered, please login."
                  })
                });
              });
            })
            .catch(err => {
              console.log(err);
              this.setState({
                errors: this.state.errors.concat(err),
                loading: false
              });
            });
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    }
  };
  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };
  errorClassName = inputName => {
    const { errors } = this.state;
    return errors.some(error =>
      error.message.toLowerCase().includes(inputName.toLowerCase())
    )
      ? "error"
      : "";
  };
  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      messages,
      loading
    } = this.state;
    return (
      <Grid className="app" textAlign="center" verticalAlign="middle">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="chat" color="orange" />
            Register for Boone Family Chat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                type="text"
                value={username}
                className={this.errorClassName("username")}
              />
              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                type="email"
                value={email}
                className={this.errorClassName("email")}
              />
              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                type="password"
                value={password}
                className={this.errorClassName("password")}
              />
              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
                type="password"
                value={passwordConfirmation}
                className={this.errorClassName("passwordConfirmation")}
              />
              <Button
                className={loading ? "loading" : ""}
                disabled={loading}
                color="orange"
                fluid
                size="large"
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          {messages.length > 0 && (
            <Message info>
              <h3>Message</h3>
              {this.displayMessages(messages)}
            </Message>
          )}
          <Message>
            Already a user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
