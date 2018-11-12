import React from "react";
import { Comment, Image } from "semantic-ui-react";
import moment from "moment";

const isOwnMessage = (message, user) =>
  message.user.id === user.uid ? "message__self" : "";

const timeFromNow = timestamp => moment(timestamp).fromNow();
const isImage = message => {
  return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

const containsURL = ({ content }) => {
  var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  if (pattern.test(content)) {
    return true;
  }
  return false;
};
const getKey = message => `${message.timestamp}-${message.user.id}`;

const Message = ({ message, user, openModal }) => {
  return (
    <Comment>
      <Comment.Avatar src={message.user.avatar} />
      <Comment.Content className={isOwnMessage(message, user)}>
        <Comment.Author as="a">{message.user.name}</Comment.Author>
        <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>

        {containsURL(message) ? (
          <div>
            <a href={message.content} target="_blank">
              {message.content}
            </a>
          </div>
        ) : (
          [
            isImage(message) ? (
              <Image
                onClick={() => openModal(message)}
                key={getKey(message)}
                src={message.image}
                className="message__image"
              />
            ) : (
              <Comment.Text key={getKey(message)}>
                {message.content}
              </Comment.Text>
            )
          ]
        )}
      </Comment.Content>
    </Comment>
  );
};

export default Message;
